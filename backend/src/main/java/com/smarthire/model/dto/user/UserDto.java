package com.smarthire.model.dto.user;

import com.smarthire.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Role role;
    private boolean active;
    private LocalDateTime createdAt;
    private CandidateProfileDto candidateProfile;
    private HRProfileDto hrProfile;
}
