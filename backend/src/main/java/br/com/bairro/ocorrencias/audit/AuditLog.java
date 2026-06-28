package br.com.bairro.ocorrencias.audit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    private UUID id;

    @Column(name = "table_name", nullable = false, length = 80)
    private String tableName;

    @Column(nullable = false, length = 120)
    private String action;

    @Column(name = "record_id")
    private UUID recordId;

    @Column(name = "user_name", nullable = false, length = 120)
    private String userName;

    @Column(name = "user_email", nullable = false, length = 180)
    private String userEmail;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        id = id == null ? UUID.randomUUID() : id;
        createdAt = createdAt == null ? LocalDateTime.now() : createdAt;
    }

    public UUID getId() {
        return id;
    }

    public String getTableName() {
        return tableName;
    }

    public String getAction() {
        return action;
    }

    public UUID getRecordId() {
        return recordId;
    }

    public String getUserName() {
        return userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getDetails() {
        return details;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public void setRecordId(UUID recordId) {
        this.recordId = recordId;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
