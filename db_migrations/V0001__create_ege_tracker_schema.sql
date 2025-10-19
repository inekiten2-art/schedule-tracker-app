-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица предметов пользователя
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    part1_from INTEGER NOT NULL,
    part1_to INTEGER NOT NULL,
    part2_from INTEGER NOT NULL,
    part2_to INTEGER NOT NULL,
    part2_max_points JSONB NOT NULL,
    icon VARCHAR(50) DEFAULT 'BookOpen',
    color VARCHAR(50) DEFAULT 'bg-blue-500',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица попыток решения заданий
CREATE TABLE task_attempts (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL REFERENCES subjects(id),
    task_number INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'failed', 'skipped')),
    points INTEGER,
    max_points INTEGER,
    attempt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX idx_subjects_user_id ON subjects(user_id);
CREATE INDEX idx_task_attempts_subject_id ON task_attempts(subject_id);
CREATE INDEX idx_task_attempts_task_number ON task_attempts(task_number);
