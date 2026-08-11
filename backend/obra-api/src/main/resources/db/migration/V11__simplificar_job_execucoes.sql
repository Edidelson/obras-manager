-- ============================================================
-- ObraManager — Simplificar Tabela job_execucoes
-- V11__simplificar_job_execucoes.sql
-- ============================================================

-- Dropa a tabela antiga
DROP TABLE IF EXISTS job_execucoes CASCADE;

-- Recria com estrutura simplificada
CREATE TABLE job_execucoes (
    nome_job        VARCHAR(100)  NOT NULL,
    status          VARCHAR(20)   NOT NULL, -- 'SUCESSO', 'ERRO'
    quantidade_notif INTEGER       DEFAULT 0,
    executado_em    TIME          NOT NULL,
    proxima_exec    TIME,
    PRIMARY KEY (nome_job, executado_em)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_job_execucoes_nome ON job_execucoes(nome_job);
CREATE INDEX IF NOT EXISTS idx_job_execucoes_status ON job_execucoes(status);
