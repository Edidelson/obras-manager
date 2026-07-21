-- ============================================================
-- ObraManager — Schema Inicial
-- V1__schema_inicial.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id           BIGSERIAL PRIMARY KEY,
    nome         VARCHAR(100)  NOT NULL,
    email        VARCHAR(255)  NOT NULL UNIQUE,
    telefone     VARCHAR(20),
    senha_hash   VARCHAR(255)  NOT NULL,
    foto_url     TEXT,
    ativo        BOOLEAN       NOT NULL DEFAULT true,
    criado_em    TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS obras (
    id                    BIGSERIAL PRIMARY KEY,
    usuario_id            BIGINT        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome                  VARCHAR(150)  NOT NULL,
    descricao             TEXT,
    endereco              VARCHAR(255),
    valor_total_planejado DECIMAL(15,2),
    data_inicio           DATE,
    data_previsao         DATE,
    status                VARCHAR(30)   NOT NULL DEFAULT 'PLANEJAMENTO',
    foto_capa             TEXT,
    criado_em             TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em         TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS etapas (
    id                   BIGSERIAL PRIMARY KEY,
    obra_id              BIGINT        NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    nome                 VARCHAR(100)  NOT NULL,
    ordem                INTEGER,
    status               VARCHAR(30)   NOT NULL DEFAULT 'AGUARDANDO',
    percentual_concluido DECIMAL(5,2)  NOT NULL DEFAULT 0,
    data_inicio          DATE,
    data_previsao        DATE,
    data_conclusao       DATE,
    observacoes          TEXT
);

CREATE TABLE IF NOT EXISTS categorias (
    id    BIGSERIAL PRIMARY KEY,
    nome  VARCHAR(80) NOT NULL UNIQUE,
    icone VARCHAR(50),
    cor   VARCHAR(7)
);

CREATE TABLE IF NOT EXISTS fornecedores (
    id            BIGSERIAL PRIMARY KEY,
    usuario_id    BIGINT        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome          VARCHAR(150)  NOT NULL,
    telefone      VARCHAR(20),
    whatsapp      VARCHAR(20),
    email         VARCHAR(255),
    cidade        VARCHAR(100),
    avaliacao     DECIMAL(3,1)  NOT NULL DEFAULT 0,
    observacoes   TEXT,
    ativo         BOOLEAN       NOT NULL DEFAULT true,
    criado_em     TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS produtos (
    id                   BIGSERIAL PRIMARY KEY,
    categoria_id         BIGINT        REFERENCES categorias(id),
    usuario_id           BIGINT        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome                 VARCHAR(150)  NOT NULL,
    unidade              VARCHAR(20),
    quantidade_planejada DECIMAL(12,3) NOT NULL DEFAULT 0,
    quantidade_comprada  DECIMAL(12,3) NOT NULL DEFAULT 0,
    preco_medio          DECIMAL(12,2) NOT NULL DEFAULT 0,
    ativo                BOOLEAN       NOT NULL DEFAULT true,
    criado_em            TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em        TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cotacoes (
    id             BIGSERIAL PRIMARY KEY,
    produto_id     BIGINT        NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    fornecedor_id  BIGINT        NOT NULL REFERENCES fornecedores(id),
    preco_unitario DECIMAL(12,2) NOT NULL,
    data_cotacao   DATE,
    validade       DATE,
    observacoes    TEXT,
    ativa          BOOLEAN       NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS compras (
    id               BIGSERIAL PRIMARY KEY,
    obra_id          BIGINT        NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    fornecedor_id    BIGINT        REFERENCES fornecedores(id),
    data_compra      DATE          NOT NULL,
    valor_total      DECIMAL(15,2) NOT NULL DEFAULT 0,
    nota_fiscal_url  TEXT,
    numero_nf        VARCHAR(50),
    observacoes      TEXT,
    criado_em        TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS itens_compra (
    id             BIGSERIAL PRIMARY KEY,
    compra_id      BIGINT        NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    produto_id     BIGINT        NOT NULL REFERENCES produtos(id),
    quantidade     DECIMAL(12,3) NOT NULL,
    valor_unitario DECIMAL(12,2) NOT NULL,
    valor_total    DECIMAL(15,2) NOT NULL,
    unidade        VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS orcamentos (
    id              BIGSERIAL PRIMARY KEY,
    obra_id         BIGINT        NOT NULL UNIQUE REFERENCES obras(id) ON DELETE CASCADE,
    valor_total     DECIMAL(15,2) NOT NULL DEFAULT 0,
    mat_materiais   DECIMAL(15,2) NOT NULL DEFAULT 0,
    mat_mao_obra    DECIMAL(15,2) NOT NULL DEFAULT 0,
    mat_eletrica    DECIMAL(15,2) NOT NULL DEFAULT 0,
    mat_hidraulica  DECIMAL(15,2) NOT NULL DEFAULT 0,
    mat_acabamento  DECIMAL(15,2) NOT NULL DEFAULT 0,
    atualizado_em   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fotos (
    id          BIGSERIAL PRIMARY KEY,
    obra_id     BIGINT    NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    etapa_id    BIGINT    REFERENCES etapas(id),
    url         TEXT      NOT NULL,
    descricao   VARCHAR(255),
    tirada_em   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notificacoes (
    id          BIGSERIAL PRIMARY KEY,
    usuario_id  BIGINT       NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    obra_id     BIGINT       REFERENCES obras(id),
    tipo        VARCHAR(50)  NOT NULL,
    titulo      VARCHAR(150) NOT NULL,
    mensagem    TEXT,
    lida        BOOLEAN      NOT NULL DEFAULT false,
    criada_em   TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Índices ──
CREATE INDEX idx_obras_usuario       ON obras(usuario_id);
CREATE INDEX idx_compras_obra        ON compras(obra_id);
CREATE INDEX idx_compras_data        ON compras(data_compra);
CREATE INDEX idx_etapas_obra         ON etapas(obra_id);
CREATE INDEX idx_cotacoes_produto     ON cotacoes(produto_id);
CREATE INDEX idx_produtos_usuario    ON produtos(usuario_id);
CREATE INDEX idx_fornecedores_usuario ON fornecedores(usuario_id);
CREATE INDEX idx_notificacoes_usuario ON notificacoes(usuario_id, lida);

-- ── Categorias padrão ──
INSERT INTO categorias (nome, icone, cor) VALUES
    ('Materiais',   'cube-outline',         '#f97316'),
    ('Mão de Obra', 'people-outline',        '#3b82f6'),
    ('Elétrica',    'flash-outline',         '#eab308'),
    ('Hidráulica',  'water-outline',         '#06b6d4'),
    ('Acabamento',  'brush-outline',         '#8b5cf6'),
    ('Cobertura',   'home-outline',          '#10b981'),
    ('Fundação',    'layers-outline',        '#6b7280'),
    ('Ferramentas', 'construct-outline',     '#ef4444');
