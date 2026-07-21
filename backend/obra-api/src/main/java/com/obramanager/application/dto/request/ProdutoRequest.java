package com.obramanager.application.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record ProdutoRequest(
        @NotBlank String nome,
        String unidade,
        BigDecimal quantidadePlanejada,
        Long categoriaId
) {}
