-- ============================================================
-- ObraManager — Torna usuario_id nullable para produtos padrão
-- V4_5__produtos_usuario_nullable.sql
-- ============================================================

-- Produtos padrão do sistema não precisam ter um usuário específico
ALTER TABLE produtos
ALTER COLUMN usuario_id DROP NOT NULL;
