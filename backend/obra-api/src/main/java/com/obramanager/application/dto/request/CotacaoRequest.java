package com.obramanager.application.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CotacaoRequest(
        @NotNull Long fornecedorId,
        @NotNull @Positive BigDecimal precoUnitario,
        LocalDate dataCotacao,
        LocalDate validade,
        String observacoes
) {}
