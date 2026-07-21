package com.obramanager.application.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record OrcamentoRequest(
        @NotNull @PositiveOrZero BigDecimal valorTotal,
        @NotNull @PositiveOrZero BigDecimal matMateriais,
        @NotNull @PositiveOrZero BigDecimal matMaoObra,
        @NotNull @PositiveOrZero BigDecimal matEletrica,
        @NotNull @PositiveOrZero BigDecimal matHidraulica,
        @NotNull @PositiveOrZero BigDecimal matAcabamento
) {}
