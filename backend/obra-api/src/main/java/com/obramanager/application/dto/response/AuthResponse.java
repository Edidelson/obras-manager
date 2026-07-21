package com.obramanager.application.dto.response;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        Long usuarioId,
        String nome,
        String email
) {}
