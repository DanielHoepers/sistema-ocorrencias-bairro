package br.com.bairro.ocorrencias.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

    @NotBlank
    @Size(min = 2, max = 120)
    private String name;

    @Email
    @NotBlank
    @Size(max = 180)
    private String email;

    @Size(min = 8)
    private String newPassword;

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
