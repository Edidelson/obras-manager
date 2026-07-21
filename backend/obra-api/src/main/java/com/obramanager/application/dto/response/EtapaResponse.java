package com.obramanager.application.dto.response;

import com.obramanager.domain.entity.Etapa;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EtapaResponse(
        Long id,
        String nome,
        Integer ordem,
        Etapa.Status status,
        BigDecimal percentualConcluido,
        LocalDate dataInicio,
        LocalDate dataPrevisao,
        LocalDate dataConclusao,
        String observacoes,
        BigDecimal valorOrcado,
        BigDecimal valorGasto
) {}
