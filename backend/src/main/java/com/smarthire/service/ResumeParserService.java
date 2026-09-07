package com.smarthire.service;

import com.smarthire.model.dto.job.PageResponse;
import com.smarthire.model.dto.resume.ParsedSkillSyncRequest;
import com.smarthire.model.dto.resume.ResumeResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ResumeParserService {
    ResumeResponse parseAndUploadResume(MultipartFile file, Long candidateUserId);
    ResumeResponse getResumeById(Long resumeId, Long userId);
    PageResponse<ResumeResponse> getCandidateResumes(Long candidateUserId, int page, int size);
    ResumeResponse getLatestResume(Long candidateUserId);
    void deleteResume(Long resumeId, Long candidateUserId);
    ResumeResponse syncResumeToProfile(Long resumeId, ParsedSkillSyncRequest syncRequest, Long candidateUserId);
}
