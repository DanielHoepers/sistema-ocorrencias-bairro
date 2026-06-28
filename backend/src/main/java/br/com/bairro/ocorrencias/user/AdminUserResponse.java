package br.com.bairro.ocorrencias.user;

import java.util.UUID;

public class AdminUserResponse {

    private final UUID id;
    private final String name;
    private final String email;
    private final UserRole role;
    private final boolean active;

    public AdminUserResponse(UUID id, String name, String email, UserRole role, boolean active) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.active = active;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public UserRole getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }
}
