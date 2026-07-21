package com.obramanager.application.dto.response;

import java.math.BigDecimal;

public record ItemCompraResponse(
        Long id,
        ProdutoMini produto,
        BigDecimal quantidade,
        BigDecimal valorUnitario,
        BigDecimal valorTotal,
        String unidade
) {
    public record ProdutoMini(Long id, String nome) {}
}
