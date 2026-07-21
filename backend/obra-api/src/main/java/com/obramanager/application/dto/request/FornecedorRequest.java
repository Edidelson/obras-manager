package com.obramanager.application.dto.request;

import jakarta.validation.constraints.NotBlank;

public record FornecedorRequest(
        @NotBlank String nome,
        String telefone,
        String whatsapp,
        String email,
        String cidade,
        String observacoes
) {}
