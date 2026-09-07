package com.smarthire.service;

import com.smarthire.model.dto.job.CreateJobRequest;
import com.smarthire.model.dto.job.JobFilterRequest;
import com.smarthire.model.dto.job.JobResponse;
import com.smarthire.model.dto.job.PageResponse;
import com.smarthire.model.dto.job.UpdateJobRequest;
import com.smarthire.model.enums.JobStatus;

import java.util.Map;

public interface JobService {
    JobResponse createJob(CreateJobRequest request, Long hrUserId);
    JobResponse updateJob(Long jobId, UpdateJobRequest request, Long hrUserId);
    void deleteJob(Long jobId, Long hrUserId);
    JobResponse changeJobStatus(Long jobId, JobStatus status, Long hrUserId);
    JobResponse getJobById(Long jobId);
    PageResponse<JobResponse> getAllJobs(JobFilterRequest filter);
    PageResponse<JobResponse> getMyJobs(Long hrUserId, int page, int size, String sortBy, String sortDir);
    Map<String, Object> getJobStats(Long hrUserId);
}
