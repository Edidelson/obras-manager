package com.obramanager.api.controller;

import com.obramanager.domain.entity.Notificacao;
import com.obramanager.domain.repository.NotificacaoRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notificacoes")
@RequiredArgsConstructor
@Tag(name = "Notificações")
@SecurityRequirement(name = "bearerAuth")
public class NotificacaoController {

    private final NotificacaoRepository notificacaoRepository;

    @GetMapping("/obra/{obraId}")
    @Operation(summary = "Listar notificações de uma obra")
    public List<Notificacao> listarPorObra(@PathVariable Long obraId) {
        return notificacaoRepository.findByObraId(obraId);
    }

    @GetMapping("/obra/{obraId}/nao-lidas")
    @Operation(summary = "Listar notificações não lidas de uma obra")
    public List<Notificacao> listarNaoLidas(@PathVariable Long obraId) {
        return notificacaoRepository.findByObraIdAndNaoLida(obraId);
    }

    @GetMapping("/obra/{obraId}/contagem-nao-lidas")
    @Operation(summary = "Contar notificações não lidas")
    public long contarNaoLidas(@PathVariable Long obraId) {
        return notificacaoRepository.countNaoLidas(obraId);
    }

    @PutMapping("/{id}/marcar-como-lida")
    @Operation(summary = "Marcar notificação como lida")
    public Notificacao marcarComoLida(@PathVariable Long id) {
        Notificacao notif = notificacaoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notificação não encontrada."));
        notif.setLida(true);
        return notificacaoRepository.save(notif);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Deletar notificação")
    public void deletar(@PathVariable Long id) {
        notificacaoRepository.deleteById(id);
    }
}
