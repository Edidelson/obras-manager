package com.obramanager.application.service;

import com.obramanager.application.dto.request.LoginRequest;
import com.obramanager.application.dto.request.RegisterRequest;
import com.obramanager.application.dto.response.AuthResponse;
import com.obramanager.domain.entity.Usuario;
import com.obramanager.domain.repository.UsuarioRepository;
import com.obramanager.infrastructure.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (usuarioRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("E-mail já cadastrado.");
        }
        var usuario = Usuario.builder()
                .nome(req.nome())
                .email(req.email())
                .telefone(req.telefone())
                .senhaHash(passwordEncoder.encode(req.senha()))
                .build();
        usuarioRepository.save(usuario);
        return buildResponse(usuario);
    }

    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.senha()));
        var usuario = usuarioRepository.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
        return buildResponse(usuario);
    }

    private AuthResponse buildResponse(Usuario usuario) {
        String token = jwtService.generateToken(usuario);
        String refresh = jwtService.generateRefreshToken(usuario);
        return new AuthResponse(token, refresh, usuario.getId(), usuario.getNome(), usuario.getEmail());
    }
}
