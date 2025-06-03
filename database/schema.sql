-- Создание базы данных
CREATE DATABASE IF NOT EXISTS finance_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE finance_app;

-- Таблица пользователей
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    login VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица счетов
CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('checking', 'savings', 'credit', 'investment', 'cash') NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    initial_balance DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица категорий
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL, -- NULL для системных категорий
    name VARCHAR(255) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    icon VARCHAR(100) DEFAULT 'circle',
    color VARCHAR(7) DEFAULT '#6b7280',
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица транзакций
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_id INT NOT NULL,
    category_id INT NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Таблица бюджетов
CREATE TABLE budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    period ENUM('week', 'month', 'year') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Вставка системных категорий
INSERT INTO categories (name, type, icon, color, is_system) VALUES
-- Категории доходов
('Зарплата', 'income', 'briefcase', '#10b981', TRUE),
('Фриланс', 'income', 'laptop', '#059669', TRUE),
('Инвестиции', 'income', 'trending-up', '#0d9488', TRUE),
('Подарки', 'income', 'gift', '#0891b2', TRUE),
('Прочие доходы', 'income', 'plus-circle', '#0284c7', TRUE),

-- Категории расходов
('Продукты', 'expense', 'shopping-cart', '#ef4444', TRUE),
('Транспорт', 'expense', 'car', '#f97316', TRUE),
('Развлечения', 'expense', 'gamepad-2', '#eab308', TRUE),
('Коммунальные услуги', 'expense', 'home', '#8b5cf6', TRUE),
('Здоровье', 'expense', 'heart', '#ec4899', TRUE),
('Образование', 'expense', 'book', '#6366f1', TRUE),
('Одежда', 'expense', 'shirt', '#84cc16', TRUE),
('Рестораны', 'expense', 'utensils', '#f59e0b', TRUE),
('Путешествия', 'expense', 'plane', '#06b6d4', TRUE),
('Прочие расходы', 'expense', 'minus-circle', '#6b7280', TRUE);

-- Создание индексов для оптимизации
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_budgets_user_category ON budgets(user_id, category_id);
