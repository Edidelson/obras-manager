package com.obramanager.api.controller;

import com.obramanager.domain.entity.JobExecucao;
import com.obramanager.domain.repository.JobExecucaoRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/jobs")
@RequiredArgsConstructor
@Tag(name = "Admin - Monitoramento de Jobs")
@SecurityRequirement(name = "bearerAuth")
public class JobExecucaoController {

    private final JobExecucaoRepository jobExecucaoRepository;

    @GetMapping("/execucoes")
    @Operation(summary = "Estado atual dos jobs (uma linha por job)")
    public List<JobExecucao> listar() {
        return jobExecucaoRepository.findAllByOrderByNomeJobAsc();
    }

    @GetMapping("/execucoes/{nomeJob}")
    @Operation(summary = "Estado atual de um job específico")
    public ResponseEntity<JobExecucao> buscarPorJob(@PathVariable String nomeJob) {
        return jobExecucaoRepository.findByNomeJob(nomeJob)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/status")
    @Operation(summary = "Status dos jobs com próxima execução")
    public Map<String, Object> getStatusJobs() {
        Map<String, Object> status = new HashMap<>();

        // Jobs configurados
        Map<String, String> jobs = new HashMap<>();
        jobs.put("verificarNotificacoes8h", "08:00 AM - Verifica obras atrasadas + valor excedido");
        jobs.put("verificarNotificacoes16h", "04:00 PM - Verifica obras atrasadas + valor excedido");
        status.put("jobs", jobs);

        List<JobExecucao> execucoes = jobExecucaoRepository.findAllByOrderByNomeJobAsc();
        status.put("execucoes", execucoes);

        Long totalNotificacoes = execucoes.stream()
                .filter(j -> "SUCESSO".equals(j.getStatus()))
                .mapToLong(j -> j.getQuantidadeNotif() != null ? j.getQuantidadeNotif() : 0)
                .sum();
        status.put("totalNotificacoesHoje", totalNotificacoes);

        return status;
    }
}
