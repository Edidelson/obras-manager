-- ============================================================
-- ObraManager — Adiciona coluna de imagens para produtos
-- V6__adiciona_imagens_produtos.sql
-- ============================================================

ALTER TABLE produtos ADD COLUMN imagem_url TEXT;

-- Índice para melhor performance
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);
