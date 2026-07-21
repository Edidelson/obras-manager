package com.obramanager.infrastructure.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

/**
 * Garante que requisições sem autenticação (token ausente/expirado/inválido)
 * recebam 401 Unauthorized, e não o 403 Forbidden padrão do Spring Security.
 * Isso é o que permite o interceptor do app (que escuta 401) limpar o token
 * e mandar o usuário de volta pro login automaticamente.
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                          AuthenticationException authException) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        objectMapper.writeValue(response.getWriter(), Map.of(
                "status", 401,
                "message", "Sessão expirada ou inválida. Faça login novamente."
        ));
    }
}
