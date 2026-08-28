-- =========================================================
-- Script de referencia do schema do banco.
-- OBS: com spring.jpa.hibernate.ddl-auto=update, o Hibernate
-- cria essas tabelas automaticamente ao subir a aplicacao.
-- Use este script apenas se quiser criar o banco manualmente
-- (troque ddl-auto para "validate" nesse caso).
-- =========================================================

CREATE DATABASE estoque_chuteiras;

\c estoque_chuteiras;

CREATE TABLE usuarios (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(60) NOT NULL UNIQUE,
    nome_completo   VARCHAR(120),
    senha           VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'USER')),
    ativo           BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE estoque_tamanho (
    tamanho         INTEGER PRIMARY KEY CHECK (tamanho BETWEEN 34 AND 43),
    estoque         INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
    vendas_semana   INTEGER NOT NULL DEFAULT 0 CHECK (vendas_semana >= 0),
    a_caminho       INTEGER NOT NULL DEFAULT 0 CHECK (a_caminho >= 0),
    meta            INTEGER NOT NULL DEFAULT 10 CHECK (meta >= 0)
);

CREATE TABLE relatorio_semanal (
    id              BIGSERIAL PRIMARY KEY,
    inicio_semana   DATE NOT NULL,
    fim_semana      DATE NOT NULL,
    fechado_em      TIMESTAMP NOT NULL,
    fechado_por     VARCHAR(60),
    total_vendas    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE relatorio_detalhe (
    id                  BIGSERIAL PRIMARY KEY,
    relatorio_id        BIGINT NOT NULL REFERENCES relatorio_semanal(id) ON DELETE CASCADE,
    tamanho             INTEGER NOT NULL,
    vendas              INTEGER NOT NULL DEFAULT 0,
    estoque_final       INTEGER NOT NULL DEFAULT 0,
    meta                INTEGER NOT NULL DEFAULT 10,
    compra_sugerida     INTEGER NOT NULL DEFAULT 0
);

-- Seed dos 10 tamanhos fixos (34 a 43)
INSERT INTO estoque_tamanho (tamanho, estoque, vendas_semana, a_caminho, meta)
SELECT g, 0, 0, 0, 10 FROM generate_series(34, 43) AS g;

-- Usuario administrador padrao (senha: admin123 -- troque em producao!)
-- A senha real com hash BCrypt e criada automaticamente pela aplicacao
-- na primeira inicializacao (ver DataSeedConfig.java). Este INSERT
-- e apenas ilustrativo.
