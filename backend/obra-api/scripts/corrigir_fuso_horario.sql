-- ============================================================================
-- Correção única de fuso horário — ObraManager
-- ============================================================================
-- CONTEXTO
--   Até o deploy que adicionou TZ=America/Sao_Paulo no Dockerfile, a API rodava
--   em UTC. Como as colunas são TIMESTAMP (sem fuso), todo criado_em/atualizado_em
--   gravado até ali ficou 3 horas à frente do horário de Brasília.
--
--   Este script desloca em -3h apenas os registros ANTERIORES ao deploy. O Brasil
--   não adota horário de verão desde 2019, então o deslocamento é uniforme.
--
-- ATENÇÃO — NÃO É UMA MIGRATION DO FLYWAY, E É DE PROPÓSITO.
--   Rode APENAS no banco de PRODUÇÃO (Neon), UMA ÚNICA VEZ.
--   NÃO rode no banco local: rodando a API pelo gradlew no Windows a JVM já usa
--   o fuso de Brasília, então os registros locais JÁ estão corretos.
--   Rodar duas vezes tira 6 horas. Não há desfazer automático.
--
-- ANTES DE EXECUTAR
--   Ajuste o CORTE abaixo para o instante em que o novo deploy entrou no ar,
--   escrito em UTC (ou seja: horário de Brasília + 3 horas). Tudo que for
--   anterior a esse instante é corrigido; o que vier depois já nasceu certo.
--
-- COMO USAR (DBeaver, conectado ao Neon)
--   1. Ajuste o CORTE.  2. Execute o bloco.  3. Confira o SELECT do fim.
--   4. COMMIT se estiver certo; ROLLBACK se não.
-- ============================================================================

BEGIN;

-- ── CORTE: ajuste esta linha, e só esta ─────────────────────────────────────
CREATE TEMP TABLE _corte ON COMMIT DROP AS
SELECT TIMESTAMP '2026-08-28 23:00:00' AS t;   -- <<< instante do deploy, em UTC

UPDATE usuarios      SET criado_em     = criado_em     - INTERVAL '3 hours',
                         atualizado_em = atualizado_em - INTERVAL '3 hours'
                     WHERE criado_em < (SELECT t FROM _corte);

UPDATE obras         SET criado_em     = criado_em     - INTERVAL '3 hours',
                         atualizado_em = atualizado_em - INTERVAL '3 hours'
                     WHERE criado_em < (SELECT t FROM _corte);

UPDATE fornecedores  SET criado_em     = criado_em     - INTERVAL '3 hours',
                         atualizado_em = atualizado_em - INTERVAL '3 hours'
                     WHERE criado_em < (SELECT t FROM _corte);

UPDATE produtos      SET criado_em     = criado_em     - INTERVAL '3 hours',
                         atualizado_em = atualizado_em - INTERVAL '3 hours'
                     WHERE criado_em < (SELECT t FROM _corte);

UPDATE compras       SET criado_em     = criado_em     - INTERVAL '3 hours'
                     WHERE criado_em < (SELECT t FROM _corte);

UPDATE orcamentos    SET atualizado_em = atualizado_em - INTERVAL '3 hours'
                     WHERE atualizado_em < (SELECT t FROM _corte);

UPDATE fotos         SET tirada_em     = tirada_em     - INTERVAL '3 hours'
                     WHERE tirada_em < (SELECT t FROM _corte);

UPDATE notificacoes  SET criada_em     = criada_em     - INTERVAL '3 hours',
                         atualizada_em = atualizada_em - INTERVAL '3 hours'
                     WHERE criada_em < (SELECT t FROM _corte)
                       AND atualizada_em IS NOT NULL;

-- ── Verificação ─────────────────────────────────────────────────────────────
-- As compras antigas devem bater com o horário de Brasília em que foram feitas,
-- e a compra de teste criada após o deploy deve ter ficado INALTERADA.
SELECT id, data_compra, valor_total, criado_em
FROM compras
ORDER BY id DESC
LIMIT 10;

-- COMMIT;    -- descomente e execute quando os valores acima estiverem certos
-- ROLLBACK;  -- ou desfaça tudo
