package com.advice.team1.backend.application;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

/**
 * 임시 토큰 발급
 * 실제 JWT 모듈 붙기 전까지 로그인 흐름 살리려고 넣어놨어요
 * 팀장님이 Security/JWT 구현을 올리면 issueTokens 내부만 교체하면 될 거 같아요
 */
@Service
public class JwtService {

    @Value("${auth.jwt.access-exp-seconds:3600}")
    private long accessExpSeconds;

    public Map<String, Object> issueTokens(String userPublicId) {
        //여기에 이제 실제 security/JWT 구현이 되면 내부 교체할게요
        String access = "dummy-access-" + userPublicId + "-" + UUID.randomUUID();
        String refresh = "dummy-refresh-" + userPublicId + "-" + UUID.randomUUID();

        return Map.of(
                "accessToken", access,
                "refreshToken", refresh,
                "expiresIn", accessExpSeconds
        );
    }
}