ALTER TABLE occurrences
    ADD COLUMN author_user_id UUID NULL;

ALTER TABLE occurrences
    ADD CONSTRAINT fk_occurrences_author_user
    FOREIGN KEY (author_user_id)
    REFERENCES users(id);

CREATE INDEX idx_occurrences_author_user_id ON occurrences(author_user_id);
