package br.com.bairro.ocorrencias.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    Optional<User> findByIdAndDeletedAtIsNull(UUID id);

    List<User> findAllByDeletedAtIsNullOrderByNameAsc();

    boolean existsByEmail(String email);
}
