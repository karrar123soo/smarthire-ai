package com.smarthire.repository;

import com.smarthire.model.entity.HRProfile;
import com.smarthire.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HRProfileRepository extends JpaRepository<HRProfile, Long> {
    Optional<HRProfile> findByUser(User user);
    Optional<HRProfile> findByUserId(Long userId);
}
