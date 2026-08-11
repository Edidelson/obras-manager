-- ============================================================
-- ObraManager — Alterar Tabela de Execução de Jobs
-- V9__alterar_job_execucoes.sql
-- ============================================================

-- Remove colunas desnecessárias
ALTER TABLE job_execucoes DROP COLUMN IF EXISTS id CASCADE;
ALTER TABLE job_execucoes DROP COLUMN IF EXISTS mensagem CASCADE;
ALTER TABLE job_execucoes DROP COLUMN IF EXISTS tempo_exec_ms CASCADE;

-- Adiciona coluna de próxima execução
ALTER TABLE job_execucoes
ADD COLUMN IF NOT EXISTS proxima_exec TIMESTAMP;

-- Define a chave primária como nome_job + executado_em
ALTER TABLE job_execucoes
ADD CONSTRAINT pk_job_execucoes PRIMARY KEY (nome_job, executado_em);
