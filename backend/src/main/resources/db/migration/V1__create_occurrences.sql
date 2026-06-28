CREATE TABLE occurrences (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(80) NOT NULL,
    address VARCHAR(200) NOT NULL,
    status VARCHAR(30) NOT NULL,
    author_name VARCHAR(120) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_occurrences_status ON occurrences(status);
CREATE INDEX idx_occurrences_category ON occurrences(category);
CREATE INDEX idx_occurrences_address ON occurrences(address);
CREATE INDEX idx_occurrences_created_at ON occurrences(created_at);
CREATE INDEX idx_occurrences_deleted_at ON occurrences(deleted_at);
