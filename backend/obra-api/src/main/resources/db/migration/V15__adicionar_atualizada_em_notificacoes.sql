-- ============================================================
-- ObraManager — Adicionar coluna atualizada_em em notificacoes
-- V15__adicionar_atualizada_em_notificacoes.sql
-- ============================================================

ALTER TABLE notificacoes
ADD COLUMN IF NOT EXISTS atualizada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
