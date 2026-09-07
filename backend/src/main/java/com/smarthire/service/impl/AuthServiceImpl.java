package com.smarthire.service.impl;

import com.smarthire.config.JwtTokenProvider;
import com.smarthire.exception.BadRequestException;
import com.smarthire.exception.ResourceNotFoundException;
import com.smarthire.model.dto.auth.AuthResponse;
import com.smarthire.model.dto.auth.LoginRequest;
import com.smarthire.model.dto.auth.RegisterRequest;
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
import com.smarthire.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final HRProfileRepository hrProfileRepository;
    private final SkillRepository skillRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered: " + email);
        }

        // 1. Create Base User
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null)
                .role(request.getRole())
                .active(true)
                .build();

        User savedUser = userRepository.save(user);
        String headlineOrCompany = "";
        List<String> skillNames = new ArrayList<>();

        // 2. Initialize Associated Role Profile
        if (request.getRole() == Role.ROLE_CANDIDATE) {
            Set<Skill> candidateSkills = new HashSet<>();
            if (request.getSkills() != null && !request.getSkills().isEmpty()) {
                for (String skillName : request.getSkills()) {
                    String cleanName = skillName.trim();
                    if (!cleanName.isEmpty()) {
                        Skill skill = skillRepository.findByNameIgnoreCase(cleanName)
                                .orElseGet(() -> skillRepository.save(Skill.builder().name(cleanName).category("General").build()));
                        candidateSkills.add(skill);
                        skillNames.add(skill.getName());
                    }
                }
            }

            CandidateProfile profile = CandidateProfile.builder()
                    .user(savedUser)
                    .headline(request.getHeadline() != null ? request.getHeadline().trim() : "Aspiring Professional")
                    .yearsOfExperience(request.getYearsOfExperience() != null ? request.getYearsOfExperience() : 0)
                    .location(request.getLocation() != null ? request.getLocation().trim() : null)
                    .skills(candidateSkills)
                    .build();

            candidateProfileRepository.save(profile);
            headlineOrCompany = profile.getHeadline();

        } else if (request.getRole() == Role.ROLE_HR) {
            HRProfile hrProfile = HRProfile.builder()
                    .user(savedUser)
                    .companyName(request.getCompanyName() != null && !request.getCompanyName().isBlank()
                            ? request.getCompanyName().trim() : "Enterprise Recruiter")
                    .companyWebsite(request.getCompanyWebsite() != null ? request.getCompanyWebsite().trim() : null)
                    .department(request.getDepartment() != null ? request.getDepartment().trim() : "Talent Acquisition")
                    .designation(request.getDesignation() != null ? request.getDesignation().trim() : "Hiring Lead")
                    .build();

            hrProfileRepository.save(hrProfile);
            headlineOrCompany = hrProfile.getCompanyName();
        }

        // 3. Generate JWT Token
        String token = jwtTokenProvider.generateToken(savedUser);

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationDurationMs() / 1000)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .phoneNumber(savedUser.getPhoneNumber())
                .role(savedUser.getRole())
                .headlineOrCompany(headlineOrCompany)
                .skills(skillNames)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        String token = jwtTokenProvider.generateToken(user);
        String headlineOrCompany = "";
        List<String> skillNames = new ArrayList<>();

        if (user.getRole() == Role.ROLE_CANDIDATE) {
            candidateProfileRepository.findByUserId(user.getId()).ifPresent(cp -> {
                if (cp.getSkills() != null) {
                    skillNames.addAll(cp.getSkills().stream().map(Skill::getName).collect(Collectors.toList()));
                }
            });
            headlineOrCompany = candidateProfileRepository.findByUserId(user.getId())
                    .map(CandidateProfile::getHeadline).orElse("");
        } else if (user.getRole() == Role.ROLE_HR) {
            headlineOrCompany = hrProfileRepository.findByUserId(user.getId())
                    .map(HRProfile::getCompanyName).orElse("");
        }

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationDurationMs() / 1000)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .headlineOrCompany(headlineOrCompany)
                .skills(skillNames)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        CandidateProfileDto candidateProfileDto = null;
        HRProfileDto hrProfileDto = null;

        if (user.getRole() == Role.ROLE_CANDIDATE) {
            candidateProfileDto = candidateProfileRepository.findByUserId(user.getId())
                    .map(cp -> CandidateProfileDto.builder()
                            .id(cp.getId())
                            .userId(user.getId())
                            .fullName(user.getFullName())
                            .email(user.getEmail())
                            .phoneNumber(user.getPhoneNumber())
                            .headline(cp.getHeadline())
                            .summary(cp.getSummary())
                            .yearsOfExperience(cp.getYearsOfExperience())
                            .location(cp.getLocation())
                            .education(cp.getEducation())
                            .linkedinUrl(cp.getLinkedinUrl())
                            .githubUrl(cp.getGithubUrl())
                            .portfolioUrl(cp.getPortfolioUrl())
                            .skills(cp.getSkills() != null
                                    ? cp.getSkills().stream().map(Skill::getName).collect(Collectors.toList())
                                    : new ArrayList<>())
                            .build())
                    .orElse(null);

        } else if (user.getRole() == Role.ROLE_HR) {
            hrProfileDto = hrProfileRepository.findByUserId(user.getId())
                    .map(hr -> HRProfileDto.builder()
                            .id(hr.getId())
                            .userId(user.getId())
                            .fullName(user.getFullName())
                            .email(user.getEmail())
                            .phoneNumber(user.getPhoneNumber())
                            .companyName(hr.getCompanyName())
                            .companyWebsite(hr.getCompanyWebsite())
                            .companyDescription(hr.getCompanyDescription())
                            .department(hr.getDepartment())
                            .designation(hr.getDesignation())
                            .build())
                    .orElse(null);
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
}
