TRUNCATE TABLE users;

INSERT INTO users (name, email, phone, password_hash) VALUES
    ('양진혁', 'yjh123@example.com', '010-1234-5678', '{bcrypt}$2a$10$1234'),
    ('변영빈', 'byv123@example.com', '010-2345-6789', '{bcrypt}$2a$10$5678'),
    ('유승열', 'ysy123@example.com', '010-5678-1234', '{bcrypt}$2a$10$1599'),
    ('장주연', 'jjy123@example.com', '010-2468-3579', '{bcrypt}$2a$10$2345');