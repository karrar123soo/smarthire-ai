package com.smarthire.service.impl;

import com.smarthire.exception.BadRequestException;
import com.smarthire.exception.ResourceNotFoundException;
import com.smarthire.model.dto.job.*;
import com.smarthire.model.entity.HRProfile;
import com.smarthire.model.entity.Job;
import com.smarthire.model.entity.Skill;
import com.smarthire.model.entity.User;
import com.smarthire.model.enums.JobStatus;
import com.smarthire.model.enums.Role;
import com.smarthire.repository.*;
import com.smarthire.service.JobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final HRProfileRepository hrProfileRepository;
    private final SkillRepository skillRepository;
    private final ApplicationRepository applicationRepository;

    @Override
    @Transactional
    public JobResponse createJob(CreateJobRequest request, Long hrUserId) {
        User hrUser = userRepository.findById(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + hrUserId));

        if (hrUser.getRole() != Role.ROLE_HR && hrUser.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("Only HR recruiters and Administrators can post jobs");
        }

        Set<Skill> skills = resolveSkills(request.getRequiredSkills());

        Job job = Job.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .department(request.getDepartment() != null ? request.getDepartment().trim() : null)
                .location(request.getLocation() != null ? request.getLocation().trim() : "Remote")
                .jobType(request.getJobType())
                .experienceYearsRequired(request.getExperienceYearsRequired() != null ? request.getExperienceYearsRequired() : 0)
                .minSalary(request.getMinSalary())
                .maxSalary(request.getMaxSalary())
                .status(request.getStatus() != null ? request.getStatus() : JobStatus.OPEN)
                .postedBy(hrUser)
                .requiredSkills(skills)
                .build();

        Job savedJob = jobRepository.save(job);
        log.info("Job created successfully: '{}' (ID: {}) by HR User ID: {}", savedJob.getTitle(), savedJob.getId(), hrUserId);
        return mapToJobResponse(savedJob);
    }

    @Override
    @Transactional
    public JobResponse updateJob(Long jobId, UpdateJobRequest request, Long hrUserId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        validateJobOwnership(job, hrUserId);

        Set<Skill> skills = resolveSkills(request.getRequiredSkills());

        job.setTitle(request.getTitle().trim());
        job.setDescription(request.getDescription().trim());
        job.setDepartment(request.getDepartment() != null ? request.getDepartment().trim() : null);
        job.setLocation(request.getLocation() != null ? request.getLocation().trim() : "Remote");
        job.setJobType(request.getJobType());
        job.setExperienceYearsRequired(request.getExperienceYearsRequired() != null ? request.getExperienceYearsRequired() : 0);
        job.setMinSalary(request.getMinSalary());
        job.setMaxSalary(request.getMaxSalary());
        job.setStatus(request.getStatus());
        job.setRequiredSkills(skills);

        Job updatedJob = jobRepository.save(job);
        log.info("Job updated successfully: '{}' (ID: {}) by HR User ID: {}", updatedJob.getTitle(), updatedJob.getId(), hrUserId);
        return mapToJobResponse(updatedJob);
    }

    @Override
    @Transactional
    public void deleteJob(Long jobId, Long hrUserId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        validateJobOwnership(job, hrUserId);

        jobRepository.delete(job);
        log.info("Job deleted successfully (ID: {}) by HR User ID: {}", jobId, hrUserId);
    }

    @Override
    @Transactional
    public JobResponse changeJobStatus(Long jobId, JobStatus status, Long hrUserId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        validateJobOwnership(job, hrUserId);

        job.setStatus(status);
        Job saved = jobRepository.save(job);
        log.info("Job ID: {} status changed to: {}", jobId, status);
        return mapToJobResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse getJobById(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));
        return mapToJobResponse(job);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<JobResponse> getAllJobs(JobFilterRequest filter) {
        int page = Math.max(filter.getPage(), 0);
        int size = filter.getSize() > 0 ? filter.getSize() : 10;
        String sortBy = filter.getSortBy() != null ? filter.getSortBy() : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(filter.getSortDir()) ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        String keyword = (filter.getKeyword() != null && !filter.getKeyword().isBlank()) ? filter.getKeyword().trim() : null;
        String department = (filter.getDepartment() != null && !filter.getDepartment().isBlank()) ? filter.getDepartment().trim() : null;
        String location = (filter.getLocation() != null && !filter.getLocation().isBlank()) ? filter.getLocation().trim() : null;

        // In public/candidate search, if no status specified, show OPEN jobs by default
        JobStatus status = filter.getStatus();

        Page<Job> jobPage = jobRepository.filterJobs(
                keyword,
                filter.getJobType(),
                department,
                location,
                filter.getMinExperience(),
                filter.getMaxExperience(),
                filter.getMinSalary(),
                status,
                pageable
        );

        List<JobResponse> responses = jobPage.getContent().stream()
                .map(this::mapToJobResponse)
                .collect(Collectors.toList());

        return PageResponse.<JobResponse>builder()
                .content(responses)
                .pageNumber(jobPage.getNumber())
                .pageSize(jobPage.getSize())
                .totalElements(jobPage.getTotalElements())
                .totalPages(jobPage.getTotalPages())
                .isFirst(jobPage.isFirst())
                .isLast(jobPage.isLast())
                .hasNext(jobPage.hasNext())
                .hasPrevious(jobPage.hasPrevious())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<JobResponse> getMyJobs(Long hrUserId, int page, int size, String sortBy, String sortDir) {
        int pageNum = Math.max(page, 0);
        int pageSize = size > 0 ? size : 10;
        String sortField = sortBy != null ? sortBy : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(pageNum, pageSize, Sort.by(direction, sortField));
        Page<Job> jobPage = jobRepository.findByPostedById(hrUserId, pageable);

        List<JobResponse> responses = jobPage.getContent().stream()
                .map(this::mapToJobResponse)
                .collect(Collectors.toList());

        return PageResponse.<JobResponse>builder()
                .content(responses)
                .pageNumber(jobPage.getNumber())
                .pageSize(jobPage.getSize())
                .totalElements(jobPage.getTotalElements())
                .totalPages(jobPage.getTotalPages())
                .isFirst(jobPage.isFirst())
                .isLast(jobPage.isLast())
                .hasNext(jobPage.hasNext())
                .hasPrevious(jobPage.hasPrevious())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getJobStats(Long hrUserId) {
        long totalJobs = jobRepository.countByPostedById(hrUserId);
        long openJobs = jobRepository.countByPostedByIdAndStatus(hrUserId, JobStatus.OPEN);
        long draftJobs = jobRepository.countByPostedByIdAndStatus(hrUserId, JobStatus.DRAFT);
        long closedJobs = jobRepository.countByPostedByIdAndStatus(hrUserId, JobStatus.CLOSED);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalJobs", totalJobs);
        stats.put("openJobs", openJobs);
        stats.put("draftJobs", draftJobs);
        stats.put("closedJobs", closedJobs);
        return stats;
    }

    private void validateJobOwnership(Job job, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));

        if (currentUser.getRole() == Role.ROLE_ADMIN) {
            return; // Admin can modify any job
        }

        if (!job.getPostedBy().getId().equals(currentUserId)) {
            throw new BadRequestException("You do not have permission to modify this job requisition");
        }
    }

    private Set<Skill> resolveSkills(List<String> skillNames) {
        Set<Skill> skills = new HashSet<>();
        if (skillNames != null) {
            for (String sName : skillNames) {
                String clean = sName.trim();
                if (!clean.isEmpty()) {
                    Skill skill = skillRepository.findByNameIgnoreCase(clean)
                            .orElseGet(() -> skillRepository.save(Skill.builder().name(clean).category("General").build()));
                    skills.add(skill);
                }
            }
        }
        return skills;
    }

    private JobResponse mapToJobResponse(Job job) {
        String companyName = "Company";
        String companyWebsite = null;

        if (job.getPostedBy() != null) {
            Optional<HRProfile> hrOpt = hrProfileRepository.findByUserId(job.getPostedBy().getId());
            if (hrOpt.isPresent()) {
                companyName = hrOpt.get().getCompanyName();
                companyWebsite = hrOpt.get().getCompanyWebsite();
            } else {
                companyName = job.getPostedBy().getFullName() + " Requisition";
            }
        }

        List<String> skills = job.getRequiredSkills() != null
                ? job.getRequiredSkills().stream().map(Skill::getName).sorted().collect(Collectors.toList())
                : new ArrayList<>();

        long applicantsCount = 0;
        try {
            applicantsCount = applicationRepository.findByJobIdOrderByMatchScoreDesc(job.getId()).size();
        } catch (Exception ignored) {}

        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .department(job.getDepartment())
                .location(job.getLocation())
                .jobType(job.getJobType())
                .experienceYearsRequired(job.getExperienceYearsRequired())
                .minSalary(job.getMinSalary())
                .maxSalary(job.getMaxSalary())
                .status(job.getStatus())
                .postedById(job.getPostedBy() != null ? job.getPostedBy().getId() : null)
                .postedByName(job.getPostedBy() != null ? job.getPostedBy().getFullName() : null)
                .companyName(companyName)
                .companyWebsite(companyWebsite)
                .requiredSkills(skills)
                .applicantsCount(applicantsCount)
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}
