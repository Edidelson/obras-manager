-- ============================================================
-- ObraManager — Produtos Padrão de Construção
-- V5__produtos_padrao.sql
-- ============================================================
-- Popula produtos pré-cadastrados para agilizar o workflow
-- dos usuários. Produtos são compartilhados entre todos.
-- O campo usuario_id aponta para um usuário de sistema.

-- Produtos padrão do sistema (sem usuário específico)

-- ── MATERIAIS (categoria_id = 1) ──
INSERT INTO produtos (categoria_id, nome, unidade, ativo, criado_em, atualizado_em) VALUES
    (1, 'Cimento Portland CP-II 50kg', 'un', true, NOW(), NOW()),
    (1, 'Areia Média m³', 'm³', true, NOW(), NOW()),
    (1, 'Brita 0 m³', 'm³', true, NOW(), NOW()),
    (1, 'Brita 1 m³', 'm³', true, NOW(), NOW()),
    (1, 'Tijolos 6 furos', 'un', true, NOW(), NOW()),
    (1, 'Tijolos 8 furos', 'un', true, NOW(), NOW()),
    (1, 'Blocos de concreto 14x19x39cm', 'un', true, NOW(), NOW()),
    (1, 'Cal Hidratada 20kg', 'un', true, NOW(), NOW()),
    (1, 'Aditivo plastificante 1L', 'L', true, NOW(), NOW()),
    (1, 'Cola branca PVA 1kg', 'kg', true, NOW(), NOW()),
    (1, 'Argamassa AC-I 20kg', 'un', true, NOW(), NOW()),
    (1, 'Piso Cerâmico 45x45cm', 'un', true, NOW(), NOW()),
    (1, 'Azulejo 20x20cm', 'un', true, NOW(), NOW()),
    (1, 'Vidro transparente 6mm', 'm²', true, NOW(), NOW()),
    (1, 'Contramarco de madeira', 'un', true, NOW(), NOW()),
    (1, 'Madeira de Lei 2"x4"', 'm', true, NOW(), NOW()),
    (1, 'Madeira de Lei 2"x6"', 'm', true, NOW(), NOW()),
    (1,'Placa de gesso drywall 1.25x2.5m', 'un', true, NOW(), NOW()),
    (1,'Tinta látex parede 18L', 'L', true, NOW(), NOW()),
    (1,'Tinta acrílica 18L', 'L', true, NOW(), NOW()),
    (1,'Verniz 900ml', 'L', true, NOW(), NOW()),
    (1,'Fita veda rosca 12mm', 'un', true, NOW(), NOW()),
    (1,'Parafuso socarrado 3x20', 'kg', true, NOW(), NOW()),
    (1,'Parafuso socarrado 3x25', 'kg', true, NOW(), NOW()),
    (1,'Prego 2.5" galvanizado', 'kg', true, NOW(), NOW()),
    (1,'Prego 3" galvanizado', 'kg', true, NOW(), NOW());

-- ── MÃO DE OBRA (categoria_id = 2) ──
INSERT INTO produtos (categoria_id, nome, unidade, ativo, criado_em, atualizado_em) VALUES
    (2,'Pedreiro', 'dia', true, NOW(), NOW()),
    (2,'Servente', 'dia', true, NOW(), NOW()),
    (2,'Carpinteiro', 'dia', true, NOW(), NOW()),
    (2,'Mestre de obra', 'dia', true, NOW(), NOW()),
    (2,'Encanador', 'dia', true, NOW(), NOW()),
    (2,'Eletricista', 'dia', true, NOW(), NOW()),
    (2,'Pintor', 'dia', true, NOW(), NOW()),
    (2,'Azulejos/Cerâmica', 'dia', true, NOW(), NOW()),
    (2,'Bombeiro hidráulico', 'dia', true, NOW(), NOW());

-- ── ELÉTRICA (categoria_id = 3) ──
INSERT INTO produtos (categoria_id, nome, unidade, ativo, criado_em, atualizado_em) VALUES
    (3,'Fio 2.5mm² rolo 100m', 'un', true, NOW(), NOW()),
    (3,'Fio 4.0mm² rolo 100m', 'un', true, NOW(), NOW()),
    (3,'Fio 6.0mm² rolo 100m', 'un', true, NOW(), NOW()),
    (3,'Cabo 4mm² rolo 100m', 'un', true, NOW(), NOW()),
    (3,'Canaleta PVC 20x20mm', 'm', true, NOW(), NOW()),
    (3,'Canaleta PVC 30x30mm', 'm', true, NOW(), NOW()),
    (3,'Eletroduto 3/4" rolo 30m', 'un', true, NOW(), NOW()),
    (3,'Eletroduto 1" rolo 30m', 'un', true, NOW(), NOW()),
    (3,'Tomada 2p+t simples', 'un', true, NOW(), NOW()),
    (3,'Tomada 2p+t dupla', 'un', true, NOW(), NOW()),
    (3,'Interruptor simples', 'un', true, NOW(), NOW()),
    (3,'Interruptor duplo', 'un', true, NOW(), NOW()),
    (3,'Interruptor paralelo', 'un', true, NOW(), NOW()),
    (3,'Luminária embutida quadrada', 'un', true, NOW(), NOW()),
    (3,'Luminária embutida redonda', 'un', true, NOW(), NOW()),
    (3,'Disjuntor 10A monofásico', 'un', true, NOW(), NOW()),
    (3,'Disjuntor 20A monofásico', 'un', true, NOW(), NOW()),
    (3,'Disjuntor 32A monofásico', 'un', true, NOW(), NOW()),
    (3,'Quadro de distribuição 12 disjuntores', 'un', true, NOW(), NOW()),
    (3,'DPS (Protetor contra surto) 10kA', 'un', true, NOW(), NOW());

-- ── HIDRÁULICA (categoria_id = 4) ──
INSERT INTO produtos (categoria_id, nome, unidade, ativo, criado_em, atualizado_em) VALUES
    (4,'Tubo PVC soldável 20mm rolo 50m', 'un', true, NOW(), NOW()),
    (4,'Tubo PVC soldável 25mm rolo 50m', 'un', true, NOW(), NOW()),
    (4,'Tubo PVC soldável 32mm rolo 50m', 'un', true, NOW(), NOW()),
    (4,'Tubo PPR 20mm rolo 50m', 'un', true, NOW(), NOW()),
    (4,'Tubo PPR 25mm rolo 50m', 'un', true, NOW(), NOW()),
    (4,'Tubo PPR 32mm rolo 50m', 'un', true, NOW(), NOW()),
    (4,'Coxim 20mm', 'un', true, NOW(), NOW()),
    (4,'Coxim 25mm', 'un', true, NOW(), NOW()),
    (4,'Joelho 90° 20mm', 'un', true, NOW(), NOW()),
    (4,'Joelho 90° 25mm', 'un', true, NOW(), NOW()),
    (4,'Joelho 90° 32mm', 'un', true, NOW(), NOW()),
    (4,'Tê 20mm', 'un', true, NOW(), NOW()),
    (4,'Tê 25mm', 'un', true, NOW(), NOW()),
    (4,'Tê 32mm', 'un', true, NOW(), NOW()),
    (4,'União 20mm', 'un', true, NOW(), NOW()),
    (4,'União 25mm', 'un', true, NOW(), NOW()),
    (4,'Registro esfera 20mm', 'un', true, NOW(), NOW()),
    (4,'Registro esfera 25mm', 'un', true, NOW(), NOW()),
    (4,'Registro esfera 32mm', 'un', true, NOW(), NOW()),
    (4,'Válvula de pé com crivo 1"', 'un', true, NOW(), NOW()),
    (4,'Ralos PVC anti-odor', 'un', true, NOW(), NOW()),
    (4,'Sifão PVC universal', 'un', true, NOW(), NOW()),
    (4,'Vaso sanitário', 'un', true, NOW(), NOW()),
    (4,'Pia de cozinha inox 1 cuba', 'un', true, NOW(), NOW()),
    (4,'Torneira cromada monocomando', 'un', true, NOW(), NOW()),
    (4,'Chuveiro cromado', 'un', true, NOW(), NOW());

-- ── ACABAMENTO (categoria_id = 5) ──
INSERT INTO produtos (categoria_id, nome, unidade, ativo, criado_em, atualizado_em) VALUES
    (5,'Rodapé MDF 7cm', 'm', true, NOW(), NOW()),
    (5,'Rodapé MDF 10cm', 'm', true, NOW(), NOW()),
    (5,'Moldura MDF 5cm', 'm', true, NOW(), NOW()),
    (5,'Moldura MDF 7cm', 'm', true, NOW(), NOW()),
    (5,'Polidusil branco 1kg', 'kg', true, NOW(), NOW()),
    (5,'Massa corrida 18kg', 'un', true, NOW(), NOW()),
    (5,'Lixa madeira 120', 'un', true, NOW(), NOW()),
    (5,'Lixa madeira 220', 'un', true, NOW(), NOW()),
    (5,'Lixa água 150', 'un', true, NOW(), NOW()),
    (5,'Solvente 900ml', 'L', true, NOW(), NOW()),
    (5,'Espelho bisotado 60x80cm', 'un', true, NOW(), NOW()),
    (5,'Moldura de quadro 60x80cm', 'un', true, NOW(), NOW()),
    (5,'Vidraçaria fosca 45x45cm', 'un', true, NOW(), NOW());

-- ── COBERTURA (categoria_id = 6) ──
INSERT INTO produtos (categoria_id, nome, unidade, ativo, criado_em, atualizado_em) VALUES
    (6,'Telha cerâmica colonial', 'un', true, NOW(), NOW()),
    (6,'Telha cerâmica romana', 'un', true, NOW(), NOW()),
    (6,'Telha de concreto tipo francesa', 'un', true, NOW(), NOW()),
    (6,'Telha francesinha de concreto', 'un', true, NOW(), NOW()),
    (6,'Telha metálica galvanizada', 'm²', true, NOW(), NOW()),
    (6,'Manta asfáltica 1mm', 'm²', true, NOW(), NOW()),
    (6,'Calha metálica galvanizada 200mm', 'm', true, NOW(), NOW()),
    (6,'Condutor metálico galvanizado 100mm', 'm', true, NOW(), NOW()),
    (6,'Trama 50mm', 'm', true, NOW(), NOW()),
    (6,'Ripa de madeira 1"x2"', 'm', true, NOW(), NOW()),
    (6,'Ripa de madeira 1"x3"', 'm', true, NOW(), NOW()),
    (6,'Caibro 2"x3"', 'm', true, NOW(), NOW()),
    (6,'Caibro 2"x5"', 'm', true, NOW(), NOW()),
    (6,'Terça de madeira 3"x4"', 'm', true, NOW(), NOW());

-- ── FUNDAÇÃO (categoria_id = 7) ──
INSERT INTO produtos (categoria_id, nome, unidade, ativo, criado_em, atualizado_em) VALUES
    (7,'Brita 0', 'm³', true, NOW(), NOW()),
    (7,'Brita 1', 'm³', true, NOW(), NOW()),
    (7,'Brita 2', 'm³', true, NOW(), NOW()),
    (7,'Brita 3', 'm³', true, NOW(), NOW()),
    (7,'Ferro CA-50 8mm', 'un', true, NOW(), NOW()),
    (7,'Ferro CA-50 10mm', 'un', true, NOW(), NOW()),
    (7,'Ferro CA-50 12mm', 'un', true, NOW(), NOW()),
    (7,'Arame recozido 1mm', 'kg', true, NOW(), NOW()),
    (7,'Manta de drenagem', 'm²', true, NOW(), NOW()),
    (7,'Tubo drenante 100mm', 'm', true, NOW(), NOW()),
    (7,'Impermeabilizante acrílico 18L', 'L', true, NOW(), NOW()),
    (7,'Elastômero 18L', 'L', true, NOW(), NOW());

-- ── FERRAMENTAS (categoria_id = 8) ──
INSERT INTO produtos (categoria_id, nome, unidade, ativo, criado_em, atualizado_em) VALUES
    (8,'Pá quadrada', 'un', true, NOW(), NOW()),
    (8,'Pá côncava', 'un', true, NOW(), NOW()),
    (8,'Enxada', 'un', true, NOW(), NOW()),
    (8,'Picareta', 'un', true, NOW(), NOW()),
    (8,'Carrinho de mão', 'un', true, NOW(), NOW()),
    (8,'Escada de madeira 3m', 'un', true, NOW(), NOW()),
    (8,'Escada alumínio 3m', 'un', true, NOW(), NOW()),
    (8,'Andaime tubular 1.5m', 'un', true, NOW(), NOW()),
    (8,'Nível 1.2m', 'un', true, NOW(), NOW()),
    (8,'Trena 5m', 'un', true, NOW(), NOW()),
    (8,'Trena 10m', 'un', true, NOW(), NOW()),
    (8,'Martelo', 'un', true, NOW(), NOW()),
    (8,'Chave inglesa 8"', 'un', true, NOW(), NOW()),
    (8,'Jogo chaves de fenda', 'un', true, NOW(), NOW()),
    (8,'Jogo chaves Philips', 'un', true, NOW(), NOW()),
    (8,'Óculos de proteção', 'un', true, NOW(), NOW()),
    (8,'Luva de proteção (par)', 'un', true, NOW(), NOW()),
    (8,'Capacete de segurança', 'un', true, NOW(), NOW()),
    (8,'Respirador com filtro', 'un', true, NOW(), NOW()),
    (8,'Cinto de segurança', 'un', true, NOW(), NOW());
