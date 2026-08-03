package com.obramanager.api.controller;

import com.obramanager.domain.entity.JobExecucao;
import com.obramanager.domain.repository.JobExecucaoRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

    @GetMapping("/execucoes/ultimas")
    @Operation(summary = "Últimas 50 execuções de jobs")
    public List<JobExecucao> listarUltimas() {
        return jobExecucaoRepository.findUltimas50();
    }

    @GetMapping("/execucoes/{nomeJob}")
    @Operation(summary = "Histórico de execução de um job específico")
    public List<JobExecucao> listarPorJob(@PathVariable String nomeJob) {
        return jobExecucaoRepository.findByNomeJob(nomeJob);
    }

    @GetMapping("/execucoes/desde/{horas}")
    @Operation(summary = "Execuções dos últimas N horas")
    public List<JobExecucao> listarUltimas(@PathVariable int horas) {
        LocalDateTime desde = LocalDateTime.now().minusHours(horas);
        return jobExecucaoRepository.findUltimos(desde);
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

        // Últimas execuções
        List<JobExecucao> ultimas = jobExecucaoRepository.findUltimas50();
        status.put("ultimasExecucoes", ultimas);

        // Próximas execuções programadas
        Map<String, String> proximasExecucoes = new HashMap<>();
        proximasExecucoes.put("verificarNotificacoes8h", "Próxima: 08:00 AM (diariamente)");
        proximasExecucoes.put("verificarNotificacoes16h", "Próxima: 04:00 PM (diariamente)");
        status.put("proximasExecucoes", proximasExecucoes);

        // Total de notificações criadas
        Long totalNotificacoes = ultimas.stream()
                .filter(j -> "SUCESSO".equals(j.getStatus()))
                .mapToLong(j -> j.getQuantidadeNotif() != null ? j.getQuantidadeNotif() : 0)
                .sum();
        status.put("totalNotificacoesHoje", totalNotificacoes);

        return status;
    }
}
