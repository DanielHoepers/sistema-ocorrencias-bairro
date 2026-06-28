package br.com.bairro.ocorrencias.occurrence.dto;

import br.com.bairro.ocorrencias.occurrence.OccurrenceStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public class OccurrenceResponse {

    private UUID id;
    private String title;
    private String description;
    private String category;
    private String address;
    private Double latitude;
    private Double longitude;
    private OccurrenceStatus status;
    private String authorName;
    private boolean ownedByCurrentUser;
    private boolean canManage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UUID getId() {
        return id;
    }

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

    public OccurrenceStatus getStatus() {
        return status;
    }

    public String getAuthorName() {
        return authorName;
    }

    public boolean isOwnedByCurrentUser() {
        return ownedByCurrentUser;
    }

    public boolean isCanManage() {
        return canManage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public void setStatus(OccurrenceStatus status) {
        this.status = status;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public void setOwnedByCurrentUser(boolean ownedByCurrentUser) {
        this.ownedByCurrentUser = ownedByCurrentUser;
    }

    public void setCanManage(boolean canManage) {
        this.canManage = canManage;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
