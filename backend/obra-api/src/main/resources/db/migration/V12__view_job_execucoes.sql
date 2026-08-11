-- ============================================================
-- ObraManager — Converter job_execucoes completamente
-- V12__view_job_execucoes.sql
-- ============================================================

-- Dropa tudo
DROP VIEW IF EXISTS v_job_execucoes CASCADE;
DROP TABLE IF EXISTS job_execucoes CASCADE;

-- Recria limpo com TIME puro
CREATE TABLE job_execucoes (
    nome_job        VARCHAR(100)  NOT NULL,
    status          VARCHAR(20)   NOT NULL,
    quantidade_notif INTEGER       DEFAULT 0,
    executado_em    TIME          NOT NULL,
    proxima_exec    TIME,
    PRIMARY KEY (nome_job, executado_em)
);

-- Índices
CREATE INDEX idx_job_execucoes_nome ON job_execucoes(nome_job);
CREATE INDEX idx_job_execucoes_status ON job_execucoes(status);

-- VIEW para exibição (apenas HH:MM:SS sem milissegundos)
CREATE VIEW v_job_execucoes AS
SELECT
    nome_job,
    status,
    quantidade_notif,
    TO_CHAR(executado_em, 'HH24:MI:SS') as executado_em,
    TO_CHAR(proxima_exec, 'HH24:MI:SS') as proxima_exec
FROM job_execucoes
ORDER BY executado_em DESC;
