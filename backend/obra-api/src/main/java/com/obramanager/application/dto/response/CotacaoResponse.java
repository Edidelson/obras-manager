package com.obramanager.application.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CotacaoResponse(
        Long id,
        Long fornecedorId,
        String fornecedorNome,
        String fornecedorCidade,
        BigDecimal precoUnitario,
        LocalDate dataCotacao,
        LocalDate validade,
        boolean menorPreco,
        BigDecimal diferencaParaMelhor
) {}
