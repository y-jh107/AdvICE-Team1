package com.advice.team1.backend.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="user_id")
    private Long id;

    private String name;
    private String email;
    private String phone;

    @Column(name="password_hash", nullable = false)
    private String password;

    @OneToMany(mappedBy = "user")
    private List<GroupMember> groups = new ArrayList<>();
}