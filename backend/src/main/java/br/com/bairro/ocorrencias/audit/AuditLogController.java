package br.com.bairro.ocorrencias.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/logs")
public class AuditLogController {

    private final AuditLogRepository repository;

    public AuditLogController(AuditLogRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public Page<AuditLogResponse> list(
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return repository.findAll(pageable).map(AuditLogResponse::new);
    }
}
