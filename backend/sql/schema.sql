-- Création de la base de données
CREATE DATABASE IF NOT EXISTS gestion_depenses;
USE gestion_depenses;

-- Table Utilisateur
CREATE TABLE utilisateurs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom_utilisateur VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    motdepasse VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table Compte
CREATE TABLE comptes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL,
    solde_initial DECIMAL(10,2) DEFAULT 0,
    solde_actuel DECIMAL(10,2) DEFAULT 0,
    type ENUM('CASH', 'BANK', 'MOBILE_MONEY') NOT NULL,
    user_id INT NOT NULL,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Table Catégorie
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL,
    description TEXT,
    limite_budget DECIMAL(10,2),
    parent_id INT NULL,
    user_id INT NULL,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Table Transaction
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    montant DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    type ENUM('INCOME', 'EXPENSE') NOT NULL,
    compte_id INT NOT NULL,
    categorie_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (compte_id) REFERENCES comptes(id) ON DELETE CASCADE,
    FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Index pour optimiser les recherches
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_user ON transactions(user_id);