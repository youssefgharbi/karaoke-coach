package com.youssef.karaokecoach.auth.security;

import com.youssef.karaokecoach.user.domain.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Optional;

@Service
public class AuthTokenService {

    private final byte[] secretKey;
    private final long expirationMillis;

    public AuthTokenService(@Value("${app.jwt.secret}") String secret,
                            @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
        this.secretKey = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationMillis = expirationMinutes * 60_000;
    }

    public String createToken(User user) {
        long expiresAt = System.currentTimeMillis() + expirationMillis;
        String payload = user.getId() + "|" + expiresAt + "|" + user.getEmail();
        String encodedPayload = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(payload.getBytes(StandardCharsets.UTF_8));

        return encodedPayload + "." + sign(encodedPayload);
    }

    public Optional<Long> extractUserId(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        String[] parts = token.split("\\.");
        if (parts.length != 2) {
            return Optional.empty();
        }

        String encodedPayload = parts[0];
        String providedSignature = parts[1];
        String expectedSignature = sign(encodedPayload);

        if (!MessageDigest.isEqual(
                providedSignature.getBytes(StandardCharsets.UTF_8),
                expectedSignature.getBytes(StandardCharsets.UTF_8)
        )) {
            return Optional.empty();
        }

        try {
            String payload = new String(Base64.getUrlDecoder().decode(encodedPayload), StandardCharsets.UTF_8);
            String[] fields = payload.split("\\|", 3);
            if (fields.length != 3) {
                return Optional.empty();
            }

            long userId = Long.parseLong(fields[0]);
            long expiresAt = Long.parseLong(fields[1]);

            if (expiresAt < System.currentTimeMillis()) {
                return Optional.empty();
            }

            return Optional.of(userId);
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }
    }

    private String sign(String encodedPayload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretKey, "HmacSHA256"));
            byte[] signature = mac.doFinal(encodedPayload.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(signature);
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to sign auth token", exception);
        }
    }
}
