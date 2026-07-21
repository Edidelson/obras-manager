package com.obramanager.application.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record CompraRequest(
        Long fornecedorId,
        Long etapaId,
        @NotNull LocalDate dataCompra,
        String numeroNf,
        String observacoes,
        @NotEmpty @Valid List<ItemCompraRequest> itens
) {}
