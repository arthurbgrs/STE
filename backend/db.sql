CREATE DATABASE treinamento_empresa;
USE treinamento_empresa;

-- Tabela de usuários (login do sistema)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    senha VARCHAR(255),
    role ENUM('funcionario','adm') NOT NULL DEFAULT 'funcionario'
);

-- Exemplo de administrador manual:
-- INSERT INTO usuarios (nome, email, senha, role) VALUES ('Administrador', 'admin@empresa.com', 'senha123', 'adm');

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
    foto VARCHAR(255),
    ativo TINYINT(1) DEFAULT 1,
    senha VARCHAR(255) NOT NULL
);

-- Adicionar coluna ativo se a tabela já existir (para migração)
-- ALTER TABLE funcionarios ADD COLUMN ativo TINYINT(1) DEFAULT 1;
-- ALTER TABLE funcionarios ADD COLUMN senha VARCHAR(255) NOT NULL;



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
    finalizado TINYINT(1) NOT NULL DEFAULT 0,
    data_finalizacao DATETIME NULL,

    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
    ON DELETE CASCADE,

    FOREIGN KEY (treinamento_id) REFERENCES treinamentos(id)
    ON DELETE CASCADE
);

-- Migração para bases já existentes:
-- ALTER TABLE funcionario_treinamentos ADD COLUMN finalizado TINYINT(1) NOT NULL DEFAULT 0;
-- ALTER TABLE funcionario_treinamentos ADD COLUMN data_finalizacao DATETIME NULL;
