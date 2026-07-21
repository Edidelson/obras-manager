package com.obramanager.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(min = 2, max = 100) String nome,
        @NotBlank @Email String email,
        String telefone,
        @NotBlank @Size(min = 8) String senha
) {}
