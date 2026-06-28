package br.com.bairro.ocorrencias.auth;

import br.com.bairro.ocorrencias.audit.AuditLogService;
import br.com.bairro.ocorrencias.user.User;
import br.com.bairro.ocorrencias.user.UserRepository;
import br.com.bairro.ocorrencias.user.UserRole;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthCookieService authCookieService;
    private final AuditLogService auditLogService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthCookieService authCookieService,
            AuditLogService auditLogService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authCookieService = authCookieService;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        String email = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail ja cadastrado");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.MORADOR);
        user.setActive(true);

        User savedUser = userRepository.save(user);
        auditLogService.log(
                "users",
                "Cadastro de usuário",
                savedUser.getId(),
                savedUser,
                "Usuário cadastrado: " + savedUser.getEmail()
        );
        return authenticate(savedUser, response);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        String email = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "E-mail ou senha invalidos"
                ));

        if (Boolean.FALSE.equals(user.getActive())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario inativo");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha invalidos");
        }

        return authenticate(user, response);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(Authentication authentication) {
        if (
                authentication == null
                        || !authentication.isAuthenticated()
                        || !(authentication.getName() instanceof String)
                        || "anonymousUser".equals(authentication.getName())
        ) {
            return ResponseEntity.noContent().build();
        }

        User user = userRepository.findByEmailAndDeletedAtIsNull(authentication.getName())
                .orElse(null);

        if (user == null || Boolean.FALSE.equals(user.getActive())) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(toAuthResponse(user));
    }

    @PutMapping("/me")
    public AuthResponse updateMe(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request,
            HttpServletResponse response
    ) {
        User user = getAuthenticatedUser(authentication);
        String email = normalizeEmail(request.getEmail());

        if (!email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail ja cadastrado");
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        }

        user.setName(request.getName().trim());
        user.setEmail(email);

        User savedUser = userRepository.save(user);
        auditLogService.log(
                "users",
                "Alteração de conta",
                savedUser.getId(),
                savedUser,
                "Dados da própria conta atualizados"
        );
        authCookieService.addTokenCookie(response, jwtService.generateToken(savedUser));
        return toAuthResponse(savedUser);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletResponse response) {
        authCookieService.clearTokenCookie(response);
    }

    private AuthResponse authenticate(User user, HttpServletResponse response) {
        authCookieService.addTokenCookie(response, jwtService.generateToken(user));
        return toAuthResponse(user);
    }

    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (
                authentication == null
                        || !authentication.isAuthenticated()
                        || !(authentication.getName() instanceof String)
                        || "anonymousUser".equals(authentication.getName())
        ) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }

        User user = userRepository.findByEmailAndDeletedAtIsNull(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));

        if (Boolean.FALSE.equals(user.getActive())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário inativo");
        }

        return user;
    }
}
