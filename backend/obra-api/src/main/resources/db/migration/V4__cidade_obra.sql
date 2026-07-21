-- ============================================================
-- ObraManager — Cidade da obra
-- V4__cidade_obra.sql
--
-- Fornecedores e produtos são compartilhados entre todos os usuários
-- (V3 em diante, nível de aplicação). Para evitar mostrar fornecedores
-- de outras regiões, a obra passa a ter uma cidade própria, usada para
-- filtrar a lista de fornecedores pela cidade da obra ativa.
-- ============================================================

ALTER TABLE obras ADD COLUMN cidade VARCHAR(100);
