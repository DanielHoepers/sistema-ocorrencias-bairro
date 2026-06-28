package br.com.bairro.ocorrencias.occurrence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface OccurrenceRepository extends JpaRepository<Occurrence, UUID>, JpaSpecificationExecutor<Occurrence> {

    Optional<Occurrence> findByIdAndDeletedAtIsNull(UUID id);
}
