package com.advice.team1.backend.service;

import com.advice.team1.backend.common.application.JwtService;
import com.advice.team1.backend.repository.UserRepository;
import com.advice.team1.backend.domain.entity.User;
import com.advice.team1.backend.domain.dto.SignInDto;  // 실제 DTO 경로에 맞춰주세요
import com.advice.team1.backend.domain.dto.SignUpDto; // (interfaces.auth.dto 라면 그 경로로 변경)
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;
    private final JwtService jwt; // 임시 토큰 스텁 (실제 JWT 모듈 붙으면 교체)
    private final BCryptPasswordEncoder passwordEncoder;

    /**
     * 회원가입
     * 현재 User 엔티티에는 password/passwordHash 필드가 없는데,
     * 비밀번호 저장/검증은 난중에 Security 모듈 연동 시 처리
     */
    @Transactional
    public void signUp(SignUpDto req) {
        if (users.existsByEmail(req.email())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        User u = User.builder()
                .name(req.name())
                .email(req.email())
                .phone(req.phone())
                .password(passwordEncoder.encode(req.password()))
                .build();

        users.save(u);

        // Security 모듈이 준비되면 여기서 비밀번호 등록 로직 호출
    }

    /**
     * 로그인
     * 현재는 이메일 존재 여부만 확인 후 더미 토큰 발급
     */
    @Transactional(readOnly = true)
    public Map<String, Object> signIn(SignInDto req) {
        User u = users.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("로그인 정보가 일치하지 않습니다."));

        // 실제 적용 시에는 아래에서 비밀번호 검증 로직 필요할거같아요
        // if (!credentialService.matches(req.email(), req.password())) {
        //     throw new IllegalArgumentException("로그인 정보가 일치하지 않습니다.");
        // }

        // 현재 User 엔티티에 외부 userId가 없으므로 임시로 내부 PK(id)를 subject로 사용
        String email = u.getEmail();
        Long userId = u.getId();

        Map<String, Object> tokens = jwt.issueTokens(email, userId);

        Map<String, Object> data = new HashMap<>(tokens);
        data.put("user", null); // 프론트에서 필요 없으면 null하면 될 거 같아요
        return data;
    }
}