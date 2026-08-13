-- ============================================================
-- ObraManager — job_execucoes com uma linha por job
-- V16__job_execucoes_linha_unica.sql
--
-- A PK antiga era (nome_job, executado_em), o que gerava uma
-- linha nova a cada execução. Agora a PK é apenas nome_job:
-- cada execução apenas atualiza executado_em e proxima_exec.
-- ============================================================

DROP VIEW  IF EXISTS v_job_execucoes CASCADE;
DROP TABLE IF EXISTS job_execucoes CASCADE;

CREATE TABLE job_execucoes (
    nome_job         VARCHAR(100) PRIMARY KEY,
    status           VARCHAR(20)  NOT NULL,
    quantidade_notif INTEGER      DEFAULT 0,
    executado_em     TIME,
    proxima_exec     TIME
);

-- As duas únicas linhas da tabela
INSERT INTO job_execucoes (nome_job, status, quantidade_notif, executado_em, proxima_exec) VALUES
    ('verificarNotificacoes8h',  'PENDENTE', 0, NULL, '08:00:00'),
    ('verificarNotificacoes16h', 'PENDENTE', 0, NULL, '16:00:00');

-- VIEW para exibição (HH:MM:SS sem milissegundos)
CREATE VIEW v_job_execucoes AS
SELECT
    nome_job,
    status,
    quantidade_notif,
    TO_CHAR(executado_em, 'HH24:MI:SS') AS executado_em,
    TO_CHAR(proxima_exec, 'HH24:MI:SS') AS proxima_exec
FROM job_execucoes
ORDER BY nome_job;
