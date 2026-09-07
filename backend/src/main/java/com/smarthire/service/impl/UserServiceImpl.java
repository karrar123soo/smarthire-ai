package com.smarthire.service.impl;

import com.smarthire.exception.BadRequestException;
import com.smarthire.exception.ResourceNotFoundException;
import com.smarthire.model.dto.auth.ChangePasswordRequest;
import com.smarthire.model.dto.user.CandidateProfileDto;
import com.smarthire.model.dto.user.HRProfileDto;
import com.smarthire.model.dto.user.UserDto;
import com.smarthire.model.entity.CandidateProfile;
import com.smarthire.model.entity.HRProfile;
import com.smarthire.model.entity.Skill;
import com.smarthire.model.entity.User;
import com.smarthire.model.enums.Role;
import com.smarthire.repository.CandidateProfileRepository;
import com.smarthire.repository.HRProfileRepository;
import com.smarthire.repository.SkillRepository;
import com.smarthire.repository.UserRepository;
import com.smarthire.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final HRProfileRepository hrProfileRepository;
    private final SkillRepository skillRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        CandidateProfileDto candidateProfileDto = null;
        HRProfileDto hrProfileDto = null;

        if (user.getRole() == Role.ROLE_CANDIDATE) {
            candidateProfileDto = getCandidateProfile(userId);
        } else if (user.getRole() == Role.ROLE_HR) {
            hrProfileDto = getHRProfile(userId);
        }

        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .candidateProfile(candidateProfileDto)
                .hrProfile(hrProfileDto)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CandidateProfileDto getCandidateProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseGet(() -> candidateProfileRepository.save(CandidateProfile.builder()
                        .user(user)
                        .headline("Candidate")
                        .yearsOfExperience(0)
                        .build()));

        return mapToCandidateProfileDto(user, profile);
    }

    @Override
    @Transactional
    public CandidateProfileDto updateCandidateProfile(Long userId, CandidateProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            user.setFullName(dto.getFullName().trim());
        }
        if (dto.getPhoneNumber() != null) {
            user.setPhoneNumber(dto.getPhoneNumber().trim());
        }
        userRepository.save(user);

        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseGet(() -> CandidateProfile.builder().user(user).build());

        if (dto.getHeadline() != null) profile.setHeadline(dto.getHeadline().trim());
        if (dto.getSummary() != null) profile.setSummary(dto.getSummary().trim());
        if (dto.getYearsOfExperience() != null) profile.setYearsOfExperience(dto.getYearsOfExperience());
        if (dto.getLocation() != null) profile.setLocation(dto.getLocation().trim());
        if (dto.getEducation() != null) profile.setEducation(dto.getEducation().trim());
        if (dto.getLinkedinUrl() != null) profile.setLinkedinUrl(dto.getLinkedinUrl().trim());
        if (dto.getGithubUrl() != null) profile.setGithubUrl(dto.getGithubUrl().trim());
        if (dto.getPortfolioUrl() != null) profile.setPortfolioUrl(dto.getPortfolioUrl().trim());

        if (dto.getSkills() != null) {
            Set<Skill> updatedSkills = new HashSet<>();
            for (String skillName : dto.getSkills()) {
                String clean = skillName.trim();
                if (!clean.isEmpty()) {
                    Skill skill = skillRepository.findByNameIgnoreCase(clean)
                            .orElseGet(() -> skillRepository.save(Skill.builder().name(clean).category("General").build()));
                    updatedSkills.add(skill);
                }
            }
            profile.setSkills(updatedSkills);
        }

        CandidateProfile saved = candidateProfileRepository.save(profile);
        return mapToCandidateProfileDto(user, saved);
    }

    @Override
    @Transactional(readOnly = true)
    public HRProfileDto getHRProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        HRProfile profile = hrProfileRepository.findByUserId(userId)
                .orElseGet(() -> hrProfileRepository.save(HRProfile.builder()
                        .user(user)
                        .companyName("Enterprise Recruiter")
                        .department("Talent Acquisition")
                        .designation("Recruiter")
                        .build()));

        return mapToHRProfileDto(user, profile);
    }

    @Override
    @Transactional
    public HRProfileDto updateHRProfile(Long userId, HRProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            user.setFullName(dto.getFullName().trim());
        }
        if (dto.getPhoneNumber() != null) {
            user.setPhoneNumber(dto.getPhoneNumber().trim());
        }
        userRepository.save(user);

        HRProfile profile = hrProfileRepository.findByUserId(userId)
                .orElseGet(() -> HRProfile.builder().user(user).build());

        if (dto.getCompanyName() != null && !dto.getCompanyName().isBlank()) {
            profile.setCompanyName(dto.getCompanyName().trim());
        }
        if (dto.getCompanyWebsite() != null) profile.setCompanyWebsite(dto.getCompanyWebsite().trim());
        if (dto.getCompanyDescription() != null) profile.setCompanyDescription(dto.getCompanyDescription().trim());
        if (dto.getDepartment() != null) profile.setDepartment(dto.getDepartment().trim());
        if (dto.getDesignation() != null) profile.setDesignation(dto.getDesignation().trim());

        HRProfile saved = hrProfileRepository.save(profile);
        return mapToHRProfileDto(user, saved);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private CandidateProfileDto mapToCandidateProfileDto(User user, CandidateProfile profile) {
        return CandidateProfileDto.builder()
                .id(profile.getId())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .headline(profile.getHeadline())
                .summary(profile.getSummary())
                .yearsOfExperience(profile.getYearsOfExperience())
                .location(profile.getLocation())
                .education(profile.getEducation())
                .linkedinUrl(profile.getLinkedinUrl())
                .githubUrl(profile.getGithubUrl())
                .portfolioUrl(profile.getPortfolioUrl())
                .skills(profile.getSkills() != null
                        ? profile.getSkills().stream().map(Skill::getName).collect(Collectors.toList())
                        : new ArrayList<>())
                .build();
    }

    private HRProfileDto mapToHRProfileDto(User user, HRProfile profile) {
        return HRProfileDto.builder()
                .id(profile.getId())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .companyName(profile.getCompanyName())
                .companyWebsite(profile.getCompanyWebsite())
                .companyDescription(profile.getCompanyDescription())
                .department(profile.getDepartment())
                .designation(profile.getDesignation())
                .build();
    }
}
