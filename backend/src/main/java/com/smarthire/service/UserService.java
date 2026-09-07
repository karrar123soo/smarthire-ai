package com.smarthire.service;

import com.smarthire.model.dto.auth.ChangePasswordRequest;
import com.smarthire.model.dto.user.CandidateProfileDto;
import com.smarthire.model.dto.user.HRProfileDto;
import com.smarthire.model.dto.user.UserDto;

public interface UserService {
    UserDto getUserProfile(Long userId);
    CandidateProfileDto getCandidateProfile(Long userId);
    CandidateProfileDto updateCandidateProfile(Long userId, CandidateProfileDto dto);
    HRProfileDto getHRProfile(Long userId);
    HRProfileDto updateHRProfile(Long userId, HRProfileDto dto);
    void changePassword(Long userId, ChangePasswordRequest request);
}
