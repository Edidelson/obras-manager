package com.obramanager.application.dto.request;

import com.obramanager.domain.entity.Etapa;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EtapaRequest(
        @NotBlank String nome,
        Integer ordem,
        Etapa.Status status,
        BigDecimal percentualConcluido,
        LocalDate dataInicio,
        LocalDate dataPrevisao,
        LocalDate dataConclusao,
        String observacoes,
        BigDecimal valorOrcado
) {}
