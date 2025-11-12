package com.advice.team1.backend.common.application;

import com.advice.team1.backend.common.security.CustomUserPrincipal;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

@Service
public class JwtService {

    @Value("${auth.jwt.secret:change-me-to-very-long-secret-key}")
    private String secret;

    @Value("${auth.jwt.access-exp-seconds:3600}")
    private long accessExpSeconds;

    public Map<String, Object> issueTokens(String email, Long userId) {
        String accessToken = createJwt(email, userId);
        String refreshToken = "rfr-" + userId + "-" + java.util.UUID.randomUUID();

        return Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "expiresIn", accessExpSeconds
        );
    }

    private String createJwt(String subject, Long userId) {
        // header
        String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";

        // payload
        long now = Instant.now().getEpochSecond();
        long exp = now + accessExpSeconds;
        String payloadJson = String.format(
                "{\"sub\":\"%s\",\"userId\":%d,\"iat\":%d,\"exp\":%d}",
                subject, userId, now, exp
        );

        String header = base64UrlEncode(headerJson.getBytes(StandardCharsets.UTF_8));
        String payload = base64UrlEncode(payloadJson.getBytes(StandardCharsets.UTF_8));

        String unsignedToken = header + "." + payload;
        String signature = hmacSha256(unsignedToken, secret);

        return unsignedToken + "." + signature;
    }

    private String hmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(keySpec);
            byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return base64UrlEncode(raw);
        } catch (Exception e) {
            throw new RuntimeException("JWT 서명 생성 실패", e);
        }
    }

    public Long extractUserId(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) throw new IllegalArgumentException("Invalid JWT format");
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(payloadJson);
            return node.get("userId").asLong();
        } catch (Exception e) {
            throw new RuntimeException("JWT 파싱 실패", e);
        }
    }

    public Authentication getAuthentication(String token) {
        Long userId = extractUserId(token);
        String email = extractSubject(token);
        String role = "ROLE_USER";

        CustomUserPrincipal principal = CustomUserPrincipal.builder()
                .id(userId)
                .email(email)
                .role(role)
                .build();
        return new UsernamePasswordAuthenticationToken(principal, "", principal.getAuthorities());
    }

    public String extractSubject(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) throw new IllegalArgumentException("Invalid JWT format");
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(payloadJson);
            return node.get("sub").asText();
        } catch (Exception e) {
            throw new RuntimeException("JWT subject 추출 실패", e);
        }
    }

    private String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}