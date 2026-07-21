package com.obramanager.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ObraRequest(
        @NotBlank String nome,
        String descricao,
        String endereco,
        String cidade,
        @Positive BigDecimal valorTotalPlanejado,
        LocalDate dataInicio,
        LocalDate dataPrevisao,
        // Se true (ou omitido), a obra já nasce com a lista padrão de etapas
        // (Fundação, Estrutura, ...). Se false, a obra é criada sem etapas e o
        // usuário cadastra manualmente depois.
        Boolean criarEtapasPadrao
) {}
