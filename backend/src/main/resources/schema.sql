CREATE TABLE users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(100) NOT NULL
);

CREATE TABLE teams (
    team_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE DEFAULT NULL,
    memo TEXT,
    CONSTRAINT chk_team_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE TABLE team_members (
    user_id BIGINT,
    team_id BIGINT,
    PRIMARY KEY (user_id, team_id),
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams (team_id) ON DELETE CASCADE
);

CREATE TABLE expenses (
    expense_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(20) NOT NULL,
    amount DECIMAL NOT NULL,
    payment VARCHAR(20) CHECK (payment IN ('card', 'cash')),
    memo TEXT,
    location TEXT NOT NULL,
    spent_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    currency TEXT NOT NULL CHECK (currency IN ('KRW', 'JPY', 'USD', 'HKD')),
    split_mode TEXT NOT NULL CHECK (split_mode IN ('equal', 'by_percent'))
);

CREATE TABLE expense_participants (
    expense_id BIGINT,
    user_id BIGINT,
    share_amount NUMERIC(14, 2) NOT NULL CHECK (share_amount >= 0),
    share_ratio NUMERIC(6, 4) NOT NULL CHECK (share_ratio >= 0),
    PRIMARY KEY (expense_id, user_id),
    FOREIGN KEY (expense_id) REFERENCES expenses (expense_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)  REFERENCES users (user_id) ON DELETE CASCADE
);

CREATE TABLE receipts (
    receipt_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    expense_id BIGINT,
    url TEXT NOT NULL,
    FOREIGN KEY (expense_id) REFERENCES expenses (expense_id) ON DELETE CASCADE
);

CREATE TABLE events (
    event_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(20) NOT NULL,
    event_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    location TEXT NOT NULL
);