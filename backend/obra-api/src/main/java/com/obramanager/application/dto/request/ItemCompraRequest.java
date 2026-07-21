package com.obramanager.application.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ItemCompraRequest(
        @NotNull Long produtoId,
        @NotNull @Positive BigDecimal quantidade,
        @NotNull @Positive BigDecimal valorUnitario,
        String unidade
) {}
