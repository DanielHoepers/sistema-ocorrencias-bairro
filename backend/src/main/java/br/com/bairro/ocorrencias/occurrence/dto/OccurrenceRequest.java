package br.com.bairro.ocorrencias.occurrence.dto;

import br.com.bairro.ocorrencias.occurrence.OccurrenceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class OccurrenceRequest {

    @NotBlank(message = "O título é obrigatório")
    @Size(min = 5, max = 200, message = "O título deve ter entre 5 e 200 caracteres")
    private String title;

    @NotBlank(message = "A descrição é obrigatória")
    @Size(min = 10, max = 5000, message = "A descrição deve ter entre 10 e 5000 caracteres")
    private String description;

    @NotBlank(message = "A categoria é obrigatória")
    @Size(max = 80, message = "A categoria deve ter no máximo 80 caracteres")
    private String category;

    @NotBlank(message = "O endereço é obrigatório")
    @Size(max = 200, message = "O endereço deve ter no máximo 200 caracteres")
    private String address;

    private Double latitude;

    private Double longitude;

    private String authorName;

    @NotNull(message = "O status é obrigatório")
    private OccurrenceStatus status;

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public String getAddress() {
        return address;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public String getAuthorName() {
        return authorName;
    }

    public OccurrenceStatus getStatus() {
        return status;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public void setStatus(OccurrenceStatus status) {
        this.status = status;
    }
}
