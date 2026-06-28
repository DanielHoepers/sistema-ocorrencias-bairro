package br.com.bairro.ocorrencias.audit;

import java.time.LocalDateTime;
import java.util.UUID;

public class AuditLogResponse {

    private final UUID id;
    private final String tableName;
    private final String action;
    private final UUID recordId;
    private final String userName;
    private final String userEmail;
    private final String details;
    private final LocalDateTime createdAt;

    public AuditLogResponse(AuditLog log) {
        this.id = log.getId();
        this.tableName = log.getTableName();
        this.action = log.getAction();
        this.recordId = log.getRecordId();
        this.userName = log.getUserName();
        this.userEmail = log.getUserEmail();
        this.details = log.getDetails();
        this.createdAt = log.getCreatedAt();
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
}
