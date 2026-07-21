-- ============================================================
-- ObraManager — Correção de schema
-- V2__rename_foto_capa_para_foto_capa_url.sql
--
-- A entidade Obra.java mapeia o campo fotoCapa para a coluna
-- "foto_capa_url" (@Column(name = "foto_capa_url")), mas a
-- migration V1 criou a coluna como "foto_capa". Esta migration
-- corrige o nome da coluna para ficar consistente com a entidade,
-- preservando os dados já existentes.
-- ============================================================

ALTER TABLE obras RENAME COLUMN foto_capa TO foto_capa_url;
