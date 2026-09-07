package com.smarthire.service;

import com.smarthire.model.dto.interview.InterviewFeedbackRequest;
import com.smarthire.model.dto.interview.InterviewResponse;
import com.smarthire.model.dto.interview.ScheduleInterviewRequest;
import com.smarthire.model.dto.job.PageResponse;

import java.time.LocalDateTime;

public interface InterviewService {
    InterviewResponse scheduleInterview(ScheduleInterviewRequest request, Long hrUserId);
    PageResponse<InterviewResponse> getMyInterviews(Long userId, int page, int size);
    InterviewResponse getInterviewById(Long id, Long userId);
    InterviewResponse submitFeedback(Long interviewId, InterviewFeedbackRequest request, Long hrUserId);
    InterviewResponse rescheduleInterview(Long interviewId, LocalDateTime newDateTime, String newMeetingLink, Long hrUserId);
    void cancelInterview(Long interviewId, String cancellationReason, Long hrUserId);
}
