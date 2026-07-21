package com.obramanager.application.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CompraResponse(
        Long id,
        FornecedorMini fornecedor,
        EtapaMini etapa,
        LocalDate dataCompra,
        BigDecimal valorTotal,
        String numeroNf,
        String observacoes,
        List<ItemCompraResponse> itens
) {
    public record FornecedorMini(Long id, String nome, String cidade) {}
    public record EtapaMini(Long id, String nome) {}
}
