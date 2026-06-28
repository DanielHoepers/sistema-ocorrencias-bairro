package br.com.bairro.ocorrencias.user;

import br.com.bairro.ocorrencias.audit.AuditLogService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminUserSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;
    private final String name;
    private final String email;
    private final String password;
    private final AuditLogService auditLogService;

    public AdminUserSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuditLogService auditLogService,
            @Value("${app.admin.create-enabled}") boolean enabled,
            @Value("${app.admin.name}") String name,
            @Value("${app.admin.email}") String email,
            @Value("${app.admin.password}") String password
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
        this.enabled = enabled;
        this.name = name;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled || email == null || email.isBlank() || password == null || password.isBlank()) {
            return;
        }

        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            return;
        }

        User admin = new User();
        admin.setName(name == null || name.isBlank() ? "Administrador" : name.trim());
        admin.setEmail(normalizedEmail);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setRole(UserRole.ADMINISTRADOR);
        admin.setActive(true);

        User savedAdmin = userRepository.save(admin);
        auditLogService.log(
                "users",
                "Criação automática de administrador",
                savedAdmin.getId(),
                savedAdmin,
                "Administrador inicial criado pelo sistema"
        );
    }
}
