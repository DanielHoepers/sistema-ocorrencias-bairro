package br.com.bairro.ocorrencias.config;

import br.com.bairro.ocorrencias.auth.JwtService;
import br.com.bairro.ocorrencias.user.User;
import br.com.bairro.ocorrencias.user.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final String cookieName;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository,
            @Value("${app.auth.cookie-name}") String cookieName
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.cookieName = cookieName;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String token = extractToken(request);

        if (token == null || token.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        if (!jwtService.isValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        String email = jwtService.extractEmail(token);
        User user = userRepository.findByEmailAndDeletedAtIsNull(email).orElse(null);

        if (user == null || Boolean.FALSE.equals(user.getActive())) {
            filterChain.doFilter(request, response);
            return;
        }

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");

        if (authorization != null && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }

        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }
}
