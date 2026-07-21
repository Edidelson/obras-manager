package com.obramanager.application.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ObraResponse(
        Long id,
        String nome,
        String descricao,
        String endereco,
        String cidade,
        BigDecimal valorTotalPlanejado,
        LocalDate dataInicio,
        LocalDate dataPrevisao,
        String status,
        String fotoCapa
) {}
