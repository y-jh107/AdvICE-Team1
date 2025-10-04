package com.advice.team1.backend.domain.mypage.repository;

import com.advice.team1.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long>
{

}
