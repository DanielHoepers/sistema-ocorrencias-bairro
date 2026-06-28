package br.com.bairro.ocorrencias.auth;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class AuthCookieService {

    private final String cookieName;
    private final boolean secure;
    private final String sameSite;
    private final long maxAgeSeconds;

    public AuthCookieService(
            @Value("${app.auth.cookie-name}") String cookieName,
            @Value("${app.auth.cookie-secure}") boolean secure,
            @Value("${app.auth.cookie-same-site}") String sameSite,
            @Value("${app.jwt.expiration-seconds}") long maxAgeSeconds
    ) {
        this.cookieName = cookieName;
        this.secure = secure;
        this.sameSite = sameSite;
        this.maxAgeSeconds = maxAgeSeconds;
    }

    public void addTokenCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, token)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(Duration.ofSeconds(maxAgeSeconds))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void clearTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
