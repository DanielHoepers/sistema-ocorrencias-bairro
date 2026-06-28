package br.com.bairro.ocorrencias.user;

import br.com.bairro.ocorrencias.audit.AuditLogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public AdminUserController(UserRepository userRepository, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<AdminUserResponse> list(Authentication authentication) {
        ensureAdmin(authentication);

        return userRepository.findAllByDeletedAtIsNullOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @PutMapping("/{id}/role")
    public AdminUserResponse updateRole(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRoleRequest request
    ) {
        User currentUser = ensureAdmin(authentication);
        User targetUser = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        if (targetUser.getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Você não pode alterar seu próprio perfil");
        }

        targetUser.setRole(request.getRole());
        User savedUser = userRepository.save(targetUser);
        auditLogService.log(
                "users",
                "Alteração de perfil",
                savedUser.getId(),
                currentUser,
                "Perfil de " + savedUser.getEmail() + " alterado para " + savedUser.getRole().name()
        );
        return toResponse(savedUser);
    }

    @PutMapping("/{id}/active")
    public AdminUserResponse updateActive(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserActiveRequest request
    ) {
        User currentUser = ensureAdmin(authentication);
        User targetUser = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        if (targetUser.getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Você não pode desativar seu próprio usuário");
        }

        targetUser.setActive(request.getActive());
        User savedUser = userRepository.save(targetUser);
        auditLogService.log(
                "users",
                Boolean.TRUE.equals(savedUser.getActive()) ? "Ativação de usuário" : "Desativação de usuário",
                savedUser.getId(),
                currentUser,
                "Status de " + savedUser.getEmail() + " alterado para " + (Boolean.TRUE.equals(savedUser.getActive()) ? "ativo" : "inativo")
        );
        return toResponse(savedUser);
    }

    private User ensureAdmin(Authentication authentication) {
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

        if (user.getRole() != UserRole.ADMINISTRADOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso restrito ao administrador");
        }

        return user;
    }

    private AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                Boolean.TRUE.equals(user.getActive())
        );
    }
}
