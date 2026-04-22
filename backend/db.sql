CREATE DATABASE treinamento_empresa;
USE treinamento_empresa;

-- Tabela de usuários (login do sistema)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    senha VARCHAR(255)
);

-- Tabela de funcionários
CREATE TABLE funcionarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    cpf VARCHAR(20) UNIQUE,
    departamento VARCHAR(100),
    cargo VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(100),
    detalhes TEXT,
    foto VARCHAR(255)
);

-- Tabela de treinamentos
CREATE TABLE treinamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    validade VARCHAR(50),
    carga_horaria VARCHAR(50),
    categoria VARCHAR(100),
    detalhes TEXT
);

-- Treinamentos atribuídos ao funcionário
CREATE TABLE funcionario_treinamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    funcionario_id INT,
    treinamento_id INT,
    data_vencimento DATE,

    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
    ON DELETE CASCADE,

    FOREIGN KEY (treinamento_id) REFERENCES treinamentos(id)
    ON DELETE CASCADE
);