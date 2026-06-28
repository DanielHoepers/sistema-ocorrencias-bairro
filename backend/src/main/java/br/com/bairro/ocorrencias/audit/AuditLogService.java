package br.com.bairro.ocorrencias.audit;

import br.com.bairro.ocorrencias.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuditLogService {

    private static final String SYSTEM_USER = "Sistema";
    private static final String SYSTEM_EMAIL = "sistema@local";

    private final AuditLogRepository repository;

    public AuditLogService(AuditLogRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void log(String tableName, String action, UUID recordId, User user, String details) {
        AuditLog log = new AuditLog();
        log.setTableName(limit(tableName, 80));
        log.setAction(limit(action, 120));
        log.setRecordId(recordId);
        log.setUserName(limit(user == null ? SYSTEM_USER : user.getName(), 120));
        log.setUserEmail(limit(user == null ? SYSTEM_EMAIL : user.getEmail(), 180));
        log.setDetails(limit(details, 2000));

        repository.save(log);
    }

    private String limit(String value, int maxLength) {
        if (value == null || value.isBlank()) {
            return "";
        }

        String trimmed = value.trim();
        return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength);
    }
}
