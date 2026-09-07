package com.smarthire.service.impl;

import com.smarthire.exception.BadRequestException;
import com.smarthire.exception.ResourceNotFoundException;
import com.smarthire.exception.UnauthorizedException;
import com.smarthire.model.dto.interview.InterviewFeedbackRequest;
import com.smarthire.model.dto.interview.InterviewResponse;
import com.smarthire.model.dto.interview.ScheduleInterviewRequest;
import com.smarthire.model.dto.job.PageResponse;
import com.smarthire.model.entity.*;
import com.smarthire.model.enums.ApplicationStatus;
import com.smarthire.model.enums.InterviewStatus;
import com.smarthire.model.enums.NotificationType;
import com.smarthire.model.enums.Role;
import com.smarthire.repository.*;
import com.smarthire.service.InterviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final HRProfileRepository hrProfileRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public InterviewResponse scheduleInterview(ScheduleInterviewRequest request, Long hrUserId) {
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", request.getApplicationId()));

        User hrUser = userRepository.findById(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", hrUserId));

        // Verify HR ownership of the job
        if (hrUser.getRole() != Role.ROLE_ADMIN && !application.getJob().getPostedBy().getId().equals(hrUserId)) {
            throw new UnauthorizedException("You can only schedule interviews for jobs posted by your organization");
        }

        if (application.getStatus() == ApplicationStatus.REJECTED || application.getStatus() == ApplicationStatus.HIRED) {
            throw new BadRequestException("Cannot schedule interview for application with status: " + application.getStatus());
        }

        // Generate meeting link if not provided
        String meetingLink = request.getMeetingLink();
        if (meetingLink == null || meetingLink.isBlank()) {
            meetingLink = "https://meet.google.com/smh-" + UUID.randomUUID().toString().substring(0, 8);
        }

        Interview interview = Interview.builder()
                .application(application)
                .interviewer(hrUser)
                .interviewDateTime(request.getInterviewDateTime())
                .durationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 45)
                .interviewType(request.getInterviewType())
                .meetingLink(meetingLink)
                .status(InterviewStatus.SCHEDULED)
                .build();

        Interview savedInterview = interviewRepository.save(interview);

        // Update application status to INTERVIEW_SCHEDULED
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        if (request.getCustomNotes() != null && !request.getCustomNotes().isBlank()) {
            application.setHrNotes(request.getCustomNotes());
        }
        applicationRepository.save(application);

        // Notify Candidate
        sendNotification(application.getCandidate(),
                "Interview Scheduled: " + application.getJob().getTitle(),
                "Your " + request.getInterviewType() + " interview has been scheduled for " +
                request.getInterviewDateTime().toString().replace('T', ' ') + ". Meeting Link: " + meetingLink,
                NotificationType.INTERVIEW_SCHEDULED);

        return mapToInterviewResponse(savedInterview);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InterviewResponse> getMyInterviews(Long userId, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Pageable pageable = PageRequest.of(page, size);
        Page<Interview> interviewPage;

        if (user.getRole() == Role.ROLE_CANDIDATE) {
            interviewPage = interviewRepository.findByCandidateId(userId, pageable);
        } else {
            interviewPage = interviewRepository.findByHrUserId(userId, pageable);
        }

        List<InterviewResponse> content = interviewPage.getContent().stream()
                .map(this::mapToInterviewResponse)
                .collect(Collectors.toList());

        return PageResponse.<InterviewResponse>builder()
                .content(content)
                .pageNumber(interviewPage.getNumber())
                .pageSize(interviewPage.getSize())
                .totalElements(interviewPage.getTotalElements())
                .totalPages(interviewPage.getTotalPages())
                .isFirst(interviewPage.isFirst())
                .isLast(interviewPage.isLast())
                .hasNext(interviewPage.hasNext())
                .hasPrevious(interviewPage.hasPrevious())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewResponse getInterviewById(Long id, Long userId) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", id));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Long candidateId = interview.getApplication().getCandidate().getId();
        Long recruiterId = interview.getApplication().getJob().getPostedBy().getId();

        if (user.getRole() != Role.ROLE_ADMIN && !userId.equals(candidateId) && !userId.equals(recruiterId)) {
            throw new UnauthorizedException("You are not authorized to view this interview");
        }

        return mapToInterviewResponse(interview);
    }

    @Override
    @Transactional
    public InterviewResponse submitFeedback(Long interviewId, InterviewFeedbackRequest request, Long hrUserId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", interviewId));

        Application application = interview.getApplication();
        User hrUser = userRepository.findById(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", hrUserId));

        if (hrUser.getRole() != Role.ROLE_ADMIN && !application.getJob().getPostedBy().getId().equals(hrUserId)) {
            throw new UnauthorizedException("You are not authorized to submit feedback for this interview");
        }

        interview.setRating(request.getRating());
        interview.setFeedback(request.getFeedback());
        interview.setStatus(InterviewStatus.COMPLETED);

        Interview updatedInterview = interviewRepository.save(interview);

        // Optional stage progression (e.g. HIRED, REJECTED, SHORTLISTED)
        if (request.getAdvanceApplicationStatus() != null) {
            application.setStatus(request.getAdvanceApplicationStatus());
            application.setHrNotes("Interview Rating: " + request.getRating() + "/10. " + request.getFeedback());
            applicationRepository.save(application);

            String statusMessage = request.getAdvanceApplicationStatus() == ApplicationStatus.HIRED
                    ? "Congratulations! You have received a job offer for " + application.getJob().getTitle() + "!"
                    : "Update on your interview status for " + application.getJob().getTitle();

            sendNotification(application.getCandidate(),
                    "Application Update: " + application.getJob().getTitle(),
                    statusMessage,
                    NotificationType.APPLICATION_STATUS);
        }

        return mapToInterviewResponse(updatedInterview);
    }

    @Override
    @Transactional
    public InterviewResponse rescheduleInterview(Long interviewId, LocalDateTime newDateTime, String newMeetingLink, Long hrUserId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", interviewId));

        Application application = interview.getApplication();
        User hrUser = userRepository.findById(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", hrUserId));

        if (hrUser.getRole() != Role.ROLE_ADMIN && !application.getJob().getPostedBy().getId().equals(hrUserId)) {
            throw new UnauthorizedException("You are not authorized to reschedule this interview");
        }

        interview.setInterviewDateTime(newDateTime);
        if (newMeetingLink != null && !newMeetingLink.isBlank()) {
            interview.setMeetingLink(newMeetingLink);
        }
        interview.setStatus(InterviewStatus.RESCHEDULED);

        Interview updated = interviewRepository.save(interview);

        sendNotification(application.getCandidate(),
                "Interview Rescheduled: " + application.getJob().getTitle(),
                "Your interview has been rescheduled to " + newDateTime.toString().replace('T', ' ') +
                ". Updated Meeting Link: " + interview.getMeetingLink(),
                NotificationType.INTERVIEW_SCHEDULED);

        return mapToInterviewResponse(updated);
    }

    @Override
    @Transactional
    public void cancelInterview(Long interviewId, String cancellationReason, Long hrUserId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", interviewId));

        Application application = interview.getApplication();
        User hrUser = userRepository.findById(hrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", hrUserId));

        if (hrUser.getRole() != Role.ROLE_ADMIN && !application.getJob().getPostedBy().getId().equals(hrUserId)) {
            throw new UnauthorizedException("You are not authorized to cancel this interview");
        }

        interview.setStatus(InterviewStatus.CANCELLED);
        interview.setFeedback(cancellationReason != null ? "Cancelled: " + cancellationReason : "Cancelled by recruiter");
        interviewRepository.save(interview);

        sendNotification(application.getCandidate(),
                "Interview Cancelled: " + application.getJob().getTitle(),
                "Your scheduled interview was cancelled: " + (cancellationReason != null ? cancellationReason : "Please contact recruiter."),
                NotificationType.APPLICATION_STATUS);
    }

    private void sendNotification(User recipient, String title, String message, NotificationType type) {
        try {
            String safeTitle = title != null && title.length() > 200 ? title.substring(0, 197) + "..." : title;
            Notification notif = Notification.builder()
                    .recipient(recipient)
                    .title(safeTitle)
                    .message(message)
                    .type(type)
                    .isRead(false)
                    .build();
            notificationRepository.save(notif);
        } catch (Exception e) {
            log.warn("Could not save notification: {}", e.getMessage());
        }
    }

    private InterviewResponse mapToInterviewResponse(Interview i) {
        Application app = i.getApplication();
        User candidate = app.getCandidate();
        User interviewer = i.getInterviewer();

        String companyName = hrProfileRepository.findByUserId(app.getJob().getPostedBy().getId())
                .map(HRProfile::getCompanyName)
                .orElse("TechNova Solutions");

        String candidateHeadline = candidateProfileRepository.findByUserId(candidate.getId())
                .map(CandidateProfile::getHeadline)
                .orElse("Candidate");

        return InterviewResponse.builder()
                .id(i.getId())
                .applicationId(app.getId())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .jobDepartment(app.getJob().getDepartment())
                .companyName(companyName)
                .candidateId(candidate.getId())
                .candidateName(candidate.getFullName())
                .candidateEmail(candidate.getEmail())
                .candidateHeadline(candidateHeadline)
                .interviewerId(interviewer != null ? interviewer.getId() : null)
                .interviewerName(interviewer != null ? interviewer.getFullName() : "Recruitment Lead")
                .interviewDateTime(i.getInterviewDateTime())
                .durationMinutes(i.getDurationMinutes())
                .interviewType(i.getInterviewType())
                .meetingLink(i.getMeetingLink())
                .status(i.getStatus())
                .currentApplicationStatus(app.getStatus())
                .feedback(i.getFeedback())
                .rating(i.getRating())
                .createdAt(i.getCreatedAt())
                .updatedAt(i.getUpdatedAt())
                .build();
    }
}
