package br.com.bairro.ocorrencias.auth;

public class AuthResponse {

    private final String name;
    private final String email;
    private final String role;
    private final String token;

    public AuthResponse(String name, String email, String role) {
        this(name, email, role, null);
    }

    public AuthResponse(String name, String email, String role, String token) {
        this.name = name;
        this.email = email;
        this.role = role;
        this.token = token;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getToken() {
        return token;
    }
}
