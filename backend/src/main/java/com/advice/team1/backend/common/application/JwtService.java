package com.advice.team1.backend.common.application;

import org.springframework.beans.factory.annotation.Value;
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

    public Map<String, Object> issueTokens(String userPublicId) {
        String accessToken = createJwt(userPublicId);
        String refreshToken = "rfr-" + userPublicId + "-" + java.util.UUID.randomUUID();

        return Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "expiresIn", accessExpSeconds
        );
    }

    private String createJwt(String subject) {
        // header
        String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";

        // payload
        long now = Instant.now().getEpochSecond();
        long exp = now + accessExpSeconds;
        String payloadJson = String.format("{\"sub\":\"%s\",\"iat\":%d,\"exp\":%d}", subject, now, exp);

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

    private String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}