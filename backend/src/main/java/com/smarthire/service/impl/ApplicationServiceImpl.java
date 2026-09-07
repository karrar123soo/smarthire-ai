package com.smarthire.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthire.exception.BadRequestException;
import com.smarthire.exception.ResourceNotFoundException;
import com.smarthire.model.dto.application.*;
import com.smarthire.model.dto.job.PageResponse;
import com.smarthire.model.entity.*;
import com.smarthire.model.enums.ApplicationStatus;
import com.smarthire.model.enums.JobStatus;
import com.smarthire.model.enums.NotificationType;
import com.smarthire.model.enums.Role;
import com.smarthire.repository.*;
import com.smarthire.service.ApplicationService;
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
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final HRProfileRepository hrProfileRepository;
    private final ResumeRepository resumeRepository;
    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public ApplicationResponse applyToJob(ApplyJobRequest request, Long candidateUserId) {
        User candidate = userRepository.findById(candidateUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + candidateUserId));

        if (candidate.getRole() != Role.ROLE_CANDIDATE && candidate.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("Only registered candidates can submit job applications");
        }

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + request.getJobId()));

        if (job.getStatus() != JobStatus.OPEN) {
            throw new BadRequestException("This job requisition is not open for applications (Status: " + job.getStatus() + ")");
        }

        if (applicationRepository.existsByJobIdAndCandidateId(job.getId(), candidate.getId())) {
            throw new BadRequestException("You have already submitted an application for this position");
        }

        // Skill Matching & Initial Score Computation
        CandidateProfile candidateProfile = candidateProfileRepository.findByUserId(candidate.getId()).orElse(null);
        Set<Skill> candidateSkills = (candidateProfile != null && candidateProfile.getSkills() != null)
                ? candidateProfile.getSkills()
                : Collections.emptySet();

        Set<Skill> requiredSkills = job.getRequiredSkills() != null ? job.getRequiredSkills() : Collections.emptySet();

        MatchResult matchResult = calculateSkillMatch(candidateSkills, requiredSkills);

        Resume resume = null;
        if (request.getResumeId() != null) {
            resume = resumeRepository.findById(request.getResumeId()).orElse(null);
        }

        Application application = Application.builder()
                .job(job)
                .candidate(candidate)
                .resume(resume)
                .status(ApplicationStatus.APPLIED)
                .matchScore(matchResult.score)
                .matchDetailsJson(matchResult.detailsJson)
                .candidateNotes(request.getCandidateNotes() != null ? request.getCandidateNotes().trim() : null)
                .build();

        Application savedApp = applicationRepository.save(application);
        log.info("Application submitted successfully (ID: {}) by Candidate ID: {} for Job ID: {}", savedApp.getId(), candidateUserId, job.getId());

        // Create in-system notification for candidate
        createNotification(
                candidate,
                "Your application for '" + job.getTitle() + "' has been submitted successfully.",
                NotificationType.APPLICATION_STATUS
        );

        return mapToApplicationResponse(savedApp);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> getMyApplications(Long candidateUserId, int page, int size, String sortBy, String sortDir) {
        int pageNum = Math.max(page, 0);
        int pageSize = size > 0 ? size : 10;
        String sortField = sortBy != null ? sortBy : "appliedAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(pageNum, pageSize, Sort.by(direction, sortField));
        Page<Application> appPage = applicationRepository.findByCandidateId(candidateUserId, pageable);

        List<ApplicationResponse> responses = appPage.getContent().stream()
                .map(this::mapToApplicationResponse)
                .collect(Collectors.toList());

        return PageResponse.<ApplicationResponse>builder()
                .content(responses)
                .pageNumber(appPage.getNumber())
                .pageSize(appPage.getSize())
                .totalElements(appPage.getTotalElements())
                .totalPages(appPage.getTotalPages())
                .isFirst(appPage.isFirst())
                .isLast(appPage.isLast())
                .hasNext(appPage.hasNext())
                .hasPrevious(appPage.hasPrevious())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationById(Long applicationId, Long userId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        validateApplicationAccess(app, userId);
        return mapToApplicationResponse(app);
    }

    @Override
    @Transactional
    public void withdrawApplication(Long applicationId, Long candidateUserId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        if (!app.getCandidate().getId().equals(candidateUserId)) {
            throw new BadRequestException("You can only withdraw your own applications");
        }

        if (app.getStatus() == ApplicationStatus.HIRED) {
            throw new BadRequestException("Cannot withdraw an application that has been finalized as Hired");
        }

        applicationRepository.delete(app);
        log.info("Application ID: {} withdrawn by Candidate ID: {}", applicationId, candidateUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> getJobApplications(Long jobId, ApplicationStatus status, Double minScore, int page, int size, Long hrUserId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        validateJobOwnership(job, hrUserId);

        int pageNum = Math.max(page, 0);
        int pageSize = size > 0 ? size : 10;
        Pageable pageable = PageRequest.of(pageNum, pageSize, Sort.by(Sort.Direction.DESC, "matchScore", "appliedAt"));

        Page<Application> appPage = applicationRepository.filterJobApplications(jobId, status, minScore, pageable);

        List<ApplicationResponse> responses = appPage.getContent().stream()
                .map(this::mapToApplicationResponse)
                .collect(Collectors.toList());

        return PageResponse.<ApplicationResponse>builder()
                .content(responses)
                .pageNumber(appPage.getNumber())
                .pageSize(appPage.getSize())
                .totalElements(appPage.getTotalElements())
                .totalPages(appPage.getTotalPages())
                .isFirst(appPage.isFirst())
                .isLast(appPage.isLast())
                .hasNext(appPage.hasNext())
                .hasPrevious(appPage.hasPrevious())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> getRecruiterPipeline(Long hrUserId, Long jobId, ApplicationStatus status, int page, int size) {
        int pageNum = Math.max(page, 0);
        int pageSize = size > 0 ? size : 15;
        Pageable pageable = PageRequest.of(pageNum, pageSize, Sort.by(Sort.Direction.DESC, "appliedAt"));

        Page<Application> appPage = applicationRepository.filterRecruiterApplications(hrUserId, jobId, status, pageable);

        List<ApplicationResponse> responses = appPage.getContent().stream()
                .map(this::mapToApplicationResponse)
                .collect(Collectors.toList());

        return PageResponse.<ApplicationResponse>builder()
                .content(responses)
                .pageNumber(appPage.getNumber())
                .pageSize(appPage.getSize())
                .totalElements(appPage.getTotalElements())
                .totalPages(appPage.getTotalPages())
                .isFirst(appPage.isFirst())
                .isLast(appPage.isLast())
                .hasNext(appPage.hasNext())
                .hasPrevious(appPage.hasPrevious())
                .build();
    }

    @Override
    @Transactional
    public ApplicationResponse updateApplicationStatus(Long applicationId, UpdateApplicationStatusRequest request, Long hrUserId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        validateJobOwnership(app.getJob(), hrUserId);

        ApplicationStatus previousStatus = app.getStatus();
        app.setStatus(request.getStatus());
        if (request.getHrNotes() != null) {
            app.setHrNotes(request.getHrNotes().trim());
        }

        Application updated = applicationRepository.save(app);
        log.info("Application ID: {} status updated from {} to {} by HR User ID: {}", applicationId, previousStatus, request.getStatus(), hrUserId);

        // Notify candidate about the status update
        String message = String.format("Update on your application for '%s': Status is now '%s'.", app.getJob().getTitle(), request.getStatus().name().replace('_', ' '));
        createNotification(app.getCandidate(), message, NotificationType.APPLICATION_STATUS);

        return mapToApplicationResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public PipelineStatsResponse getPipelineStats(Long hrUserId) {
        long total = applicationRepository.countByJobPostedById(hrUserId);
        long applied = applicationRepository.countByJobPostedByIdAndStatus(hrUserId, ApplicationStatus.APPLIED);
        long underReview = applicationRepository.countByJobPostedByIdAndStatus(hrUserId, ApplicationStatus.UNDER_REVIEW);
        long shortlisted = applicationRepository.countByJobPostedByIdAndStatus(hrUserId, ApplicationStatus.SHORTLISTED);
        long interview = applicationRepository.countByJobPostedByIdAndStatus(hrUserId, ApplicationStatus.INTERVIEW_SCHEDULED);
        long rejected = applicationRepository.countByJobPostedByIdAndStatus(hrUserId, ApplicationStatus.REJECTED);
        long hired = applicationRepository.countByJobPostedByIdAndStatus(hrUserId, ApplicationStatus.HIRED);

        Double avg = applicationRepository.findAverageMatchScoreByHrUserId(hrUserId);
        double avgScore = avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;

        return PipelineStatsResponse.builder()
                .totalApplications(total)
                .appliedCount(applied)
                .underReviewCount(underReview)
                .shortlistedCount(shortlisted)
                .interviewScheduledCount(interview)
                .rejectedCount(rejected)
                .hiredCount(hired)
                .averageMatchScore(avgScore)
                .build();
    }

    private void validateApplicationAccess(Application app, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (user.getRole() == Role.ROLE_ADMIN) return;

        boolean isApplicant = app.getCandidate().getId().equals(userId);
        boolean isPostingRecruiter = app.getJob().getPostedBy().getId().equals(userId);

        if (!isApplicant && !isPostingRecruiter) {
            throw new BadRequestException("You do not have permission to view this application");
        }
    }

    private void validateJobOwnership(Job job, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));

        if (currentUser.getRole() == Role.ROLE_ADMIN) return;

        if (!job.getPostedBy().getId().equals(currentUserId)) {
            throw new BadRequestException("You do not have permission to manage applications for this job requisition");
        }
    }

    private MatchResult calculateSkillMatch(Set<Skill> candidateSkills, Set<Skill> requiredSkills) {
        if (requiredSkills.isEmpty()) {
            return new MatchResult(100.0, "{\"matchedSkills\":[],\"missingSkills\":[],\"matchPercentage\":100.0}");
        }

        Set<String> candidateSkillNames = candidateSkills.stream()
                .map(s -> s.getName().trim().toLowerCase())
                .collect(Collectors.toSet());

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (Skill req : requiredSkills) {
            if (candidateSkillNames.contains(req.getName().trim().toLowerCase())) {
                matched.add(req.getName());
            } else {
                missing.add(req.getName());
            }
        }

        double score = ((double) matched.size() / requiredSkills.size()) * 100.0;
        double roundedScore = Math.round(score * 10.0) / 10.0;

        Map<String, Object> details = new HashMap<>();
        details.put("matchedSkills", matched);
        details.put("missingSkills", missing);
        details.put("matchPercentage", roundedScore);

        String json = "{}";
        try {
            json = objectMapper.writeValueAsString(details);
        } catch (Exception e) {
            log.error("Failed to serialize match details JSON", e);
        }

        return new MatchResult(roundedScore, json);
    }

    private void createNotification(User recipient, String message, NotificationType type) {
        try {
            Notification notification = Notification.builder()
                    .recipient(recipient)
                    .title("Application Update")
                    .message(message)
                    .type(type)
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        } catch (Exception e) {
            log.warn("Could not save notification: {}", e.getMessage());
        }
    }

    private ApplicationResponse mapToApplicationResponse(Application app) {
        Job job = app.getJob();
        User candidate = app.getCandidate();

        String companyName = "Company";
        if (job.getPostedBy() != null) {
            Optional<HRProfile> hrOpt = hrProfileRepository.findByUserId(job.getPostedBy().getId());
            companyName = hrOpt.map(HRProfile::getCompanyName).orElseGet(() -> job.getPostedBy().getFullName() + " Requisition");
        }

        CandidateProfile candProfile = candidateProfileRepository.findByUserId(candidate.getId()).orElse(null);
        String headline = candProfile != null ? candProfile.getHeadline() : "Candidate";
        Integer exp = candProfile != null ? candProfile.getYearsOfExperience() : 0;
        String location = candProfile != null ? candProfile.getLocation() : null;

        List<String> candSkills = (candProfile != null && candProfile.getSkills() != null)
                ? candProfile.getSkills().stream().map(Skill::getName).sorted().collect(Collectors.toList())
                : Collections.emptyList();

        List<String> jobSkills = job.getRequiredSkills() != null
                ? job.getRequiredSkills().stream().map(Skill::getName).sorted().collect(Collectors.toList())
                : Collections.emptyList();

        return ApplicationResponse.builder()
                .id(app.getId())
                .jobId(job.getId())
                .jobTitle(job.getTitle())
                .jobDepartment(job.getDepartment())
                .jobLocation(job.getLocation())
                .jobType(job.getJobType())
                .minSalary(job.getMinSalary())
                .maxSalary(job.getMaxSalary())
                .companyName(companyName)
                .requiredSkills(jobSkills)
                .candidateId(candidate.getId())
                .candidateName(candidate.getFullName())
                .candidateEmail(candidate.getEmail())
                .candidatePhone(candidate.getPhoneNumber())
                .candidateHeadline(headline)
                .candidateYearsOfExperience(exp)
                .candidateLocation(location)
                .candidateSkills(candSkills)
                .status(app.getStatus())
                .matchScore(app.getMatchScore())
                .matchDetailsJson(app.getMatchDetailsJson())
                .candidateNotes(app.getCandidateNotes())
                .hrNotes(app.getHrNotes())
                .resumeId(app.getResume() != null ? app.getResume().getId() : null)
                .resumeFileName(app.getResume() != null ? app.getResume().getFileName() : null)
                .appliedAt(app.getAppliedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }

    private record MatchResult(Double score, String detailsJson) {}
}
