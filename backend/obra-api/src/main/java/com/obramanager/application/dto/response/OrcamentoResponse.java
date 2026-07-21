package com.obramanager.application.dto.response;

import java.math.BigDecimal;

public record OrcamentoResponse(
        BigDecimal valorTotal,
        BigDecimal matMateriais,
        BigDecimal matMaoObra,
        BigDecimal matEletrica,
        BigDecimal matHidraulica,
        BigDecimal matAcabamento,
        // Gasto real, apurado a partir das compras (itens cujo produto tem
        // categoria com o mesmo nome do bucket) — não editável pelo usuário.
        BigDecimal gastoMateriais,
        BigDecimal gastoMaoObra,
        BigDecimal gastoEletrica,
        BigDecimal gastoHidraulica,
        BigDecimal gastoAcabamento
) {}
