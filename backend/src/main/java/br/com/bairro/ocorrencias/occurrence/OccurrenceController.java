package br.com.bairro.ocorrencias.occurrence;

import br.com.bairro.ocorrencias.occurrence.dto.OccurrenceRequest;
import br.com.bairro.ocorrencias.occurrence.dto.OccurrenceResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/occurrences")
public class OccurrenceController {

    private final OccurrenceService service;

    public OccurrenceController(OccurrenceService service) {
        this.service = service;
    }

    @GetMapping
    public Page<OccurrenceResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) OccurrenceStatus status,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return service.list(search, category, status, pageable);
    }

    @GetMapping("/{id}")
    public OccurrenceResponse getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @PostMapping
    public ResponseEntity<OccurrenceResponse> create(@Valid @RequestBody OccurrenceRequest request) {
        OccurrenceResponse response = service.create(request);
        return ResponseEntity
                .created(URI.create("/api/occurrences/" + response.getId()))
                .body(response);
    }

    @PutMapping("/{id}")
    public OccurrenceResponse update(@PathVariable UUID id, @Valid @RequestBody OccurrenceRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
