CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    table_name VARCHAR(80) NOT NULL,
    action VARCHAR(120) NOT NULL,
    record_id UUID NULL,
    user_name VARCHAR(120) NOT NULL,
    user_email VARCHAR(180) NOT NULL,
    details TEXT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_user_email ON audit_logs(user_email);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
