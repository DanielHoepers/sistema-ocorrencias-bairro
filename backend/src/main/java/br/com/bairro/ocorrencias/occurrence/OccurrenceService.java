package br.com.bairro.ocorrencias.occurrence;

import br.com.bairro.ocorrencias.audit.AuditLogService;
import br.com.bairro.ocorrencias.occurrence.dto.OccurrenceRequest;
import br.com.bairro.ocorrencias.occurrence.dto.OccurrenceResponse;
import br.com.bairro.ocorrencias.user.User;
import br.com.bairro.ocorrencias.user.UserRepository;
import br.com.bairro.ocorrencias.user.UserRole;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class OccurrenceService {

    private final OccurrenceRepository repository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public OccurrenceService(
            OccurrenceRepository repository,
            UserRepository userRepository,
            AuditLogService auditLogService
    ) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<OccurrenceResponse> list(
            String search,
            String category,
            OccurrenceStatus status,
            Pageable pageable
    ) {
        User currentUser = getCurrentUser();

        Specification<Occurrence> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isNull(root.get("deletedAt")));

            if (search != null && !search.isBlank()) {
                String text = "%" + search.trim().toLowerCase() + "%";

                predicates.add(
                        cb.or(
                                cb.like(cb.lower(root.get("title")), text),
                                cb.like(cb.lower(root.get("description")), text),
                                cb.like(cb.lower(root.get("category")), text),
                                cb.like(cb.lower(root.get("address")), text)
                        )
                );
            }

            if (category != null && !category.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("category")), category.trim().toLowerCase()));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            query.orderBy(cb.desc(root.get("createdAt")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return repository.findAll(spec, pageable).map(occurrence -> toResponse(occurrence, currentUser));
    }

    @Transactional(readOnly = true)
    public OccurrenceResponse getById(UUID id) {
        User currentUser = getCurrentUser();

        return repository.findByIdAndDeletedAtIsNull(id)
                .map(occurrence -> toResponse(occurrence, currentUser))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Ocorrência não encontrada"));
    }

    @Transactional
    public OccurrenceResponse create(OccurrenceRequest request) {
        User currentUser = getCurrentUser();

        Occurrence occurrence = new Occurrence();
        applyEditableFields(occurrence, request);
        occurrence.setStatus(OccurrenceStatus.ABERTA);
        occurrence.setAuthor(currentUser);
        occurrence.setAuthorName(currentUser.getName());

        Occurrence savedOccurrence = repository.save(occurrence);
        auditLogService.log(
                "occurrences",
                "Cadastro de ocorrência",
                savedOccurrence.getId(),
                currentUser,
                "Ocorrência cadastrada: " + savedOccurrence.getTitle()
        );

        return toResponse(savedOccurrence, currentUser);
    }

    @Transactional
    public OccurrenceResponse update(UUID id, OccurrenceRequest request) {
        User currentUser = getCurrentUser();
        Occurrence occurrence = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Ocorrência não encontrada"));

        ensureCanManage(occurrence, currentUser);

        OccurrenceStatus currentStatus = occurrence.getStatus();
        claimLegacyOccurrence(occurrence, currentUser);
        applyEditableFields(occurrence, request);

        occurrence.setStatus(request.getStatus() == null ? currentStatus : request.getStatus());

        Occurrence savedOccurrence = repository.save(occurrence);
        auditLogService.log(
                "occurrences",
                "Alteração de ocorrência",
                savedOccurrence.getId(),
                currentUser,
                "Ocorrência alterada: " + savedOccurrence.getTitle()
        );

        return toResponse(savedOccurrence, currentUser);
    }

    @Transactional
    public void delete(UUID id) {
        User currentUser = getCurrentUser();
        Occurrence occurrence = repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Ocorrência não encontrada"));

        ensureCanManage(occurrence, currentUser);
        occurrence.setDeletedAt(LocalDateTime.now());
        repository.save(occurrence);
        auditLogService.log(
                "occurrences",
                "Exclusão de ocorrência",
                occurrence.getId(),
                currentUser,
                "Ocorrência excluída: " + occurrence.getTitle()
        );
    }

    private void applyEditableFields(Occurrence occurrence, OccurrenceRequest request) {
        occurrence.setTitle(request.getTitle().trim());
        occurrence.setDescription(request.getDescription().trim());
        occurrence.setCategory(request.getCategory().trim());
        occurrence.setAddress(request.getAddress().trim());
        occurrence.setLatitude(request.getLatitude());
        occurrence.setLongitude(request.getLongitude());
    }

    private OccurrenceResponse toResponse(Occurrence occurrence, User currentUser) {
        OccurrenceResponse response = new OccurrenceResponse();
        response.setId(occurrence.getId());
        response.setTitle(occurrence.getTitle());
        response.setDescription(occurrence.getDescription());
        response.setCategory(occurrence.getCategory());
        response.setAddress(occurrence.getAddress());
        response.setLatitude(occurrence.getLatitude());
        response.setLongitude(occurrence.getLongitude());
        response.setStatus(occurrence.getStatus());
        response.setAuthorName(occurrence.getAuthorName());
        response.setOwnedByCurrentUser(isOwner(occurrence, currentUser));
        response.setCanManage(canManage(occurrence, currentUser));
        response.setCreatedAt(occurrence.getCreatedAt());
        response.setUpdatedAt(occurrence.getUpdatedAt());
        return response;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }

        return userRepository.findByEmailAndDeletedAtIsNull(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));
    }

    private void ensureCanManage(Occurrence occurrence, User user) {
        if (!canManage(occurrence, user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode alterar esta ocorrência");
        }
    }

    private boolean canManage(Occurrence occurrence, User user) {
        return isAdmin(user) || isOwner(occurrence, user) || isLegacyOccurrence(occurrence);
    }

    private boolean isAdmin(User user) {
        return user.getRole() == UserRole.ADMINISTRADOR;
    }

    private boolean isOwner(Occurrence occurrence, User user) {
        return occurrence.getAuthor() != null && occurrence.getAuthor().getId().equals(user.getId());
    }

    private boolean isLegacyOccurrence(Occurrence occurrence) {
        return occurrence.getAuthor() == null;
    }

    private void claimLegacyOccurrence(Occurrence occurrence, User user) {
        if (!isLegacyOccurrence(occurrence)) {
            return;
        }

        occurrence.setAuthor(user);
        occurrence.setAuthorName(user.getName());
    }
}
