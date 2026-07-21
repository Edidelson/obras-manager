package com.obramanager.application.dto.response;

public record FornecedorExternoResponse(
        String nome,
        String endereco,
        String telefone,
        Double latitude,
        Double longitude
) {}
