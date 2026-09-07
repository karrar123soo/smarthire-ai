package com.smarthire.service;

import com.smarthire.model.dto.application.ApplyJobRequest;
import com.smarthire.model.dto.application.ApplicationResponse;
import com.smarthire.model.dto.application.PipelineStatsResponse;
import com.smarthire.model.dto.application.UpdateApplicationStatusRequest;
import com.smarthire.model.dto.job.PageResponse;
import com.smarthire.model.enums.ApplicationStatus;

public interface ApplicationService {
    ApplicationResponse applyToJob(ApplyJobRequest request, Long candidateUserId);
    PageResponse<ApplicationResponse> getMyApplications(Long candidateUserId, int page, int size, String sortBy, String sortDir);
    ApplicationResponse getApplicationById(Long applicationId, Long userId);
    void withdrawApplication(Long applicationId, Long candidateUserId);
    PageResponse<ApplicationResponse> getJobApplications(Long jobId, ApplicationStatus status, Double minScore, int page, int size, Long hrUserId);
    PageResponse<ApplicationResponse> getRecruiterPipeline(Long hrUserId, Long jobId, ApplicationStatus status, int page, int size);
    ApplicationResponse updateApplicationStatus(Long applicationId, UpdateApplicationStatusRequest request, Long hrUserId);
    PipelineStatsResponse getPipelineStats(Long hrUserId);
}
