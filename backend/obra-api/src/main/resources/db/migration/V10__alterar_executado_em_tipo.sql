-- ============================================================
-- ObraManager — Alterar Tipo das Colunas de Tempo
-- V10__alterar_executado_em_tipo.sql
-- ============================================================

-- Altera executado_em de TIMESTAMP para TIME (apenas hora:minuto:segundo)
ALTER TABLE job_execucoes
ALTER COLUMN executado_em TYPE TIME USING executado_em::time;

-- Altera proxima_exec de TIMESTAMP para TIME (apenas hora:minuto:segundo)
ALTER TABLE job_execucoes
ALTER COLUMN proxima_exec TYPE TIME USING proxima_exec::time;
