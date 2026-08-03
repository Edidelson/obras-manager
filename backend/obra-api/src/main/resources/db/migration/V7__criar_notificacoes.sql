-- ============================================================
-- ObraManager — Tabela de Notificações
-- V7__criar_notificacoes.sql
-- ============================================================

CREATE TABLE notificacoes (
    id              BIGSERIAL PRIMARY KEY,
    obra_id         BIGINT        NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    tipo            VARCHAR(50)   NOT NULL, -- 'ATRASADA', 'VALOR_EXCEDIDO', 'PRODUTO_FALTANDO'
    titulo          VARCHAR(150)  NOT NULL,
    mensagem        TEXT,
    lida            BOOLEAN       NOT NULL DEFAULT false,
    criada_em       TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizada_em   TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_notificacoes_obra ON notificacoes(obra_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX idx_notificacoes_criada ON notificacoes(criada_em);
