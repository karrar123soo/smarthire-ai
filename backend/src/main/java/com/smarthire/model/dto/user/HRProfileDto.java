package com.smarthire.model.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HRProfileDto {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String companyName;
    private String companyWebsite;
    private String companyDescription;
    private String department;
    private String designation;
}
