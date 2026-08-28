package com.obramanager.infrastructure.job;

import com.obramanager.domain.entity.JobExecucao;
import com.obramanager.domain.entity.Notificacao;
import com.obramanager.domain.entity.Obra;
import com.obramanager.domain.entity.Orcamento;
import com.obramanager.domain.entity.Usuario;
import com.obramanager.domain.repository.JobExecucaoRepository;
import com.obramanager.domain.repository.NotificacaoRepository;
import com.obramanager.domain.repository.ObraRepository;
import com.obramanager.domain.repository.OrcamentoRepository;
import com.obramanager.infrastructure.email.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class NotificacaoJob {

    private final ObraRepository obraRepository;
    private final OrcamentoRepository orcamentoRepository;
    private final NotificacaoRepository notificacaoRepository;
    private final JobExecucaoRepository jobExecucaoRepository;
    private final EmailService emailService;

    /** Horário fixo (cron) de cada job — usado para calcular proxima_exec. */
    private static final Map<String, LocalTime> HORARIOS_JOB = Map.of(
            "verificarNotificacoes8h",  LocalTime.of(8, 0),
            "verificarNotificacoes16h", LocalTime.of(16, 0)
    );

    /**
     * Verifica às 8h da manhã
     */
    @Scheduled(cron = "0 0 8 * * *", zone = "America/Sao_Paulo")
    public void verificarNotificacoes8h() {
        long inicio = System.currentTimeMillis();
        int notificacoes = 0;
        String status = "SUCESSO";
        String mensagem = "Verificação concluída";

        log.info("🔔 Verificando notificações...");

        try {
            int atrasadas = verificarObrasAtrasadas();
            int excedidas = verificarValorExcedido();
            notificacoes = atrasadas + excedidas;
            mensagem = String.format("Atrasadas: %d, Valor excedido: %d", atrasadas, excedidas);
        } catch (Exception e) {
            status = "ERRO";
            mensagem = e.getMessage();
            log.error("❌ Erro ao verificar notificações: {}", e.getMessage());
        } finally {
            long tempoExec = System.currentTimeMillis() - inicio;
            registrarExecucao("verificarNotificacoes8h", status, mensagem, notificacoes, tempoExec);
        }
    }

    /**
     * Verifica às 16h (4 da tarde)
     */
    @Scheduled(cron = "0 0 16 * * *", zone = "America/Sao_Paulo")
    public void verificarNotificacoes16h() {
        long inicio = System.currentTimeMillis();
        int notificacoes = 0;
        String status = "SUCESSO";
        String mensagem = "Verificação concluída";

        log.info("🔔 Verificando notificações...");

        try {
            int atrasadas = verificarObrasAtrasadas();
            int excedidas = verificarValorExcedido();
            notificacoes = atrasadas + excedidas;
            mensagem = String.format("Atrasadas: %d, Valor excedido: %d", atrasadas, excedidas);
        } catch (Exception e) {
            status = "ERRO";
            mensagem = e.getMessage();
            log.error("❌ Erro ao verificar notificações: {}", e.getMessage());
        } finally {
            long tempoExec = System.currentTimeMillis() - inicio;
            registrarExecucao("verificarNotificacoes16h", status, mensagem, notificacoes, tempoExec);
        }
    }

    private int verificarObrasAtrasadas() {
        log.info("⏰ Verificando obras atrasadas...");
        int notificacoesCriadas = 0;

        try {
            List<Obra> obras = obraRepository.findAll();
            log.info("📊 Total de obras: {}", obras.size());

            for (Obra obra : obras) {
                log.info("🔍 Obra: {} - DataPrevisao: {}", obra.getNome(), obra.getDataPrevisao());

                if (obra.getDataPrevisao() != null && obra.getDataPrevisao().isBefore(LocalDate.now())) {
                    // Obra está atrasada
                    long diasAtrasado = java.time.temporal.ChronoUnit.DAYS
                            .between(obra.getDataPrevisao(), LocalDate.now());

                    log.info("⚠️ Obra ATRASADA: {} ({} dias)", obra.getNome(), diasAtrasado);

                    // Verifica se já notificou hoje
                    List<Notificacao> notifsExistentes = notificacaoRepository.findByObraId(obra.getId());
                    log.info("📋 Notificações existentes: {}", notifsExistentes.size());

                    boolean jaNotificado = notifsExistentes.stream()
                            .anyMatch(n -> n.getTipo().equals("ATRASADA") &&
                                    n.getCriadaEm().toLocalDate().equals(LocalDate.now()));

                    log.info("✅ Já notificado hoje? {}", jaNotificado);

                    if (!jaNotificado) {
                        log.info("📧 CRIANDO notificação para: {}", obra.getNome());
                        criarNotificacaoAtrasada(obra, (int) diasAtrasado);
                        notificacoesCriadas++;
                    }
                } else {
                    log.debug("❌ Obra NÃO atrasada: {}", obra.getNome());
                }
            }

            log.info("✅ Verificação de obras atrasadas concluída ({} notificações criadas)", notificacoesCriadas);

        } catch (Exception e) {
            log.error("❌ Erro ao verificar obras atrasadas: {}", e.getMessage(), e);
        }

        return notificacoesCriadas;
    }

    private int verificarValorExcedido() {
        log.info("💰 Verificando valores excedidos...");
        int notificacoesCriadas = 0;

        try {
            List<Obra> obras = obraRepository.findAll();
            log.info("📊 Total de obras: {}", obras.size());

            for (Obra obra : obras) {
                log.info("🔍 Obra: {} - ValorPlanejado: {}", obra.getNome(), obra.getValorTotalPlanejado());

                Orcamento orcamento = orcamentoRepository.findByObraId(obra.getId())
                        .orElse(null);

                log.info("📋 Orçamento encontrado: {}", orcamento != null ? orcamento.getValorTotal() : "NENHUM");

                if (orcamento != null &&
                        orcamento.getValorTotal().compareTo(BigDecimal.ZERO) > 0 &&
                        obra.getValorTotalPlanejado() != null) {

                    log.info("💵 Comparando: {} > {} ?", orcamento.getValorTotal(), obra.getValorTotalPlanejado());

                    if (orcamento.getValorTotal().compareTo(obra.getValorTotalPlanejado()) > 0) {
                        log.info("⚠️ EXCEDIDO: {}", obra.getNome());
                        // Orçamento excedido
                        boolean jaNotificado = notificacaoRepository
                                .findByObraId(obra.getId()).stream()
                                .anyMatch(n -> n.getTipo().equals("VALOR_EXCEDIDO") &&
                                        n.getCriadaEm().toLocalDate().equals(LocalDate.now()));

                        log.info("✅ Já notificado hoje? {}", jaNotificado);

                        if (!jaNotificado) {
                            log.info("📧 CRIANDO notificação para: {}", obra.getNome());
                            criarNotificacaoValorExcedido(obra, orcamento);
                            notificacoesCriadas++;
                        }
                    }
                }
            }

            log.info("✅ Verificação de valores concluída ({})", notificacoesCriadas);

        } catch (Exception e) {
            log.error("❌ Erro ao verificar valores: {}", e.getMessage());
        }

        return notificacoesCriadas;
    }

    // ─────────────── Helpers ───────────────

    private void criarNotificacaoAtrasada(Obra obra, int diasAtrasado) {
        Notificacao notif = Notificacao.builder()
                .obra(obra)
                .usuario(obra.getUsuario())
                .tipo("ATRASADA")
                .titulo("⏰ Obra Atrasada")
                .mensagem(String.format("A obra '%s' está %d dias atrasada!", obra.getNome(), diasAtrasado))
                .lida(false)
                .build();

        notificacaoRepository.save(notif);

        // Enviar email
        if (obra.getUsuario() != null && obra.getUsuario().getEmail() != null) {
            emailService.notificacaoObraAtrasada(
                    obra.getUsuario().getEmail(),
                    obra.getNome(),
                    diasAtrasado
            );
        }

        log.info("📢 Notificação criada: Obra atrasada - {}", obra.getNome());
    }

    private void criarNotificacaoValorExcedido(Obra obra, Orcamento orcamento) {
        Notificacao notif = Notificacao.builder()
                .obra(obra)
                .usuario(obra.getUsuario())
                .tipo("VALOR_EXCEDIDO")
                .titulo("💰 Orçamento Excedido")
                .mensagem(String.format("O orçamento foi excedido em R$ %.2f",
                        orcamento.getValorTotal().subtract(obra.getValorTotalPlanejado())))
                .lida(false)
                .build();

        notificacaoRepository.save(notif);

        // Enviar email
        if (obra.getUsuario() != null && obra.getUsuario().getEmail() != null) {
            emailService.notificacaoValorExcedido(
                    obra.getUsuario().getEmail(),
                    obra.getNome(),
                    obra.getValorTotalPlanejado().doubleValue(),
                    orcamento.getValorTotal().doubleValue()
            );
        }

        log.info("📢 Notificação criada: Valor excedido - {}", obra.getNome());
    }

    /**
     * Atualiza a linha única do job (não cria histórico).
     * Apenas executado_em, proxima_exec, status e quantidade_notif mudam.
     */
    private void registrarExecucao(String nomeJob, String status, String mensagem, int quantidadeNotif, long tempoExecMs) {
        try {
            // Horário atual em Brasília (UTC-3)
            ZoneId zoneIdBrasilia = ZoneId.of("America/Sao_Paulo");
            LocalTime agora = LocalTime.now(zoneIdBrasilia);
            LocalTime proximaExec = HORARIOS_JOB.getOrDefault(nomeJob, agora);

            JobExecucao execucao = jobExecucaoRepository.findByNomeJob(nomeJob)
                    .orElseGet(() -> JobExecucao.builder().nomeJob(nomeJob).build());

            execucao.setStatus(status);
            execucao.setQuantidadeNotif(quantidadeNotif);
            execucao.setExecutadoEm(agora);
            execucao.setProximaExec(proximaExec);

            jobExecucaoRepository.save(execucao);
            log.info("✅ Execução atualizada: {} ({}) às {} - Próxima: {}", nomeJob, status, agora, proximaExec);

        } catch (Exception e) {
            log.error("❌ Erro ao registrar execução do job: {}", e.getMessage());
        }
    }
}
