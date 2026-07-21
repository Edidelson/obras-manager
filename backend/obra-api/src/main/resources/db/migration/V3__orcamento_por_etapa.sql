-- ============================================================
-- ObraManager — Orçamento por etapa
-- V3__orcamento_por_etapa.sql
--
-- Permite que cada etapa tenha um valor orçado e que compras sejam
-- vinculadas a uma etapa específica. Com isso o percentual concluído
-- da etapa pode ser calculado automaticamente (valor gasto / valor
-- orçado) em vez de ser sempre atualizado manualmente.
-- ============================================================

ALTER TABLE etapas ADD COLUMN valor_orcado DECIMAL(15,2);

ALTER TABLE compras ADD COLUMN etapa_id BIGINT REFERENCES etapas(id);

CREATE INDEX idx_compras_etapa ON compras(etapa_id);
