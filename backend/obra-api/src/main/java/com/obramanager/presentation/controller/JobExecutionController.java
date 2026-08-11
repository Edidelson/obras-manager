package com.obramanager.presentation.controller;

import com.obramanager.infrastructure.job.NotificacaoJob;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/jobs")
@RequiredArgsConstructor
@Slf4j
public class JobExecutionController {

    private final NotificacaoJob notificacaoJob;

    /**
     * Força execução do job de notificações (8h)
     */
    @PostMapping("/executar/8h")
    public ResponseEntity<String> executarJob8h() {
        try {
            log.info("🔔 Executando job verificarNotificacoes8h manualmente...");
            notificacaoJob.verificarNotificacoes8h();
            return ResponseEntity.ok("✅ Job 8h executado com sucesso!");
        } catch (Exception e) {
            log.error("❌ Erro ao executar job 8h: {}", e.getMessage());
            return ResponseEntity.status(500).body("❌ Erro: " + e.getMessage());
        }
    }

    /**
     * Força execução do job de notificações (16h)
     */
    @PostMapping("/executar/16h")
    public ResponseEntity<String> executarJob16h() {
        try {
            log.info("🔔 Executando job verificarNotificacoes16h manualmente...");
            notificacaoJob.verificarNotificacoes16h();
            return ResponseEntity.ok("✅ Job 16h executado com sucesso!");
        } catch (Exception e) {
            log.error("❌ Erro ao executar job 16h: {}", e.getMessage());
            return ResponseEntity.status(500).body("❌ Erro: " + e.getMessage());
        }
    }

    /**
     * Força execução de AMBOS os jobs
     */
    @PostMapping("/executar/todos")
    public ResponseEntity<String> executarTodos() {
        try {
            log.info("🔔 Executando todos os jobs manualmente...");
            notificacaoJob.verificarNotificacoes8h();
            notificacaoJob.verificarNotificacoes16h();
            return ResponseEntity.ok("✅ Todos os jobs executados com sucesso!");
        } catch (Exception e) {
            log.error("❌ Erro ao executar jobs: {}", e.getMessage());
            return ResponseEntity.status(500).body("❌ Erro: " + e.getMessage());
        }
    }
}
