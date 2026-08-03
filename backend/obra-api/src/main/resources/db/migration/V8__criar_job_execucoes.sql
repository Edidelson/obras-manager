-- ============================================================
-- ObraManager — Tabela de Execução de Jobs
-- V8__criar_job_execucoes.sql
-- ============================================================

CREATE TABLE job_execucoes (
    id              BIGSERIAL PRIMARY KEY,
    nome_job        VARCHAR(100)  NOT NULL,
    status          VARCHAR(20)   NOT NULL, -- 'SUCESSO', 'ERRO'
    mensagem        TEXT,
    quantidade_notif INTEGER       DEFAULT 0,
    tempo_exec_ms   BIGINT,
    executado_em    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_job_execucoes_nome ON job_execucoes(nome_job);
CREATE INDEX idx_job_execucoes_data ON job_execucoes(executado_em DESC);
CREATE INDEX idx_job_execucoes_status ON job_execucoes(status);
