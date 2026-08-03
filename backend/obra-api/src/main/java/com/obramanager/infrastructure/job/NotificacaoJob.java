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
import java.util.List;

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

    /**
     * Verifica às 8h da manhã se orçamento foi excedido
     */
    /**
     * Verifica às 8h da manhã todas as notificações
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void verificarNotificacoes8h() {
        long inicio = System.currentTimeMillis();
        int notificacoes = 0;
        String status = "SUCESSO";
        String mensagem = "Verificação concluída";

        log.info("🔔 Verificando notificações às 8h...");

        try {
            int atrasadas = verificarObrasAtrasadas();
            int excedidas = verificarValorExcedido();
            notificacoes = atrasadas + excedidas;
            mensagem = String.format("Atrasadas: %d, Valor excedido: %d", atrasadas, excedidas);
        } catch (Exception e) {
            status = "ERRO";
            mensagem = e.getMessage();
            log.error("❌ Erro ao verificar notificações às 8h: {}", e.getMessage());
        } finally {
            long tempoExec = System.currentTimeMillis() - inicio;
            registrarExecucao("verificarNotificacoes8h", status, mensagem, notificacoes, tempoExec);
        }
    }

    /**
     * Verifica às 16h (4 da tarde) todas as notificações
     */
    @Scheduled(cron = "0 0 16 * * *")
    public void verificarNotificacoes16h() {
        long inicio = System.currentTimeMillis();
        int notificacoes = 0;
        String status = "SUCESSO";
        String mensagem = "Verificação concluída";

        log.info("🔔 Verificando notificações às 16h...");

        try {
            int atrasadas = verificarObrasAtrasadas();
            int excedidas = verificarValorExcedido();
            notificacoes = atrasadas + excedidas;
            mensagem = String.format("Atrasadas: %d, Valor excedido: %d", atrasadas, excedidas);
        } catch (Exception e) {
            status = "ERRO";
            mensagem = e.getMessage();
            log.error("❌ Erro ao verificar notificações às 16h: {}", e.getMessage());
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

            for (Obra obra : obras) {
                if (obra.getDataPrevisao() != null && obra.getDataPrevisao().isBefore(LocalDate.now())) {
                    // Obra está atrasada
                    long diasAtrasado = java.time.temporal.ChronoUnit.DAYS
                            .between(obra.getDataPrevisao(), LocalDate.now());

                    // Verifica se já notificou hoje
                    boolean jaNotificado = notificacaoRepository
                            .findByObraId(obra.getId()).stream()
                            .anyMatch(n -> n.getTipo().equals("ATRASADA") &&
                                    n.getCriadaEm().toLocalDate().equals(LocalDate.now()));

                    if (!jaNotificado) {
                        criarNotificacaoAtrasada(obra, (int) diasAtrasado);
                        notificacoesCriadas++;
                    }
                }
            }

            log.info("✅ Verificação de obras atrasadas concluída ({})", notificacoesCriadas);

        } catch (Exception e) {
            log.error("❌ Erro ao verificar obras atrasadas: {}", e.getMessage());
        }

        return notificacoesCriadas;
    }

    private int verificarValorExcedido() {
        log.info("💰 Verificando valores excedidos...");
        int notificacoesCriadas = 0;

        try {
            List<Obra> obras = obraRepository.findAll();

            for (Obra obra : obras) {
                Orcamento orcamento = orcamentoRepository.findByObraId(obra.getId())
                        .orElse(null);

                if (orcamento != null &&
                        orcamento.getValorTotal().compareTo(BigDecimal.ZERO) > 0 &&
                        obra.getValorTotalPlanejado() != null) {

                    if (orcamento.getValorTotal().compareTo(obra.getValorTotalPlanejado()) > 0) {
                        // Orçamento excedido
                        boolean jaNotificado = notificacaoRepository
                                .findByObraId(obra.getId()).stream()
                                .anyMatch(n -> n.getTipo().equals("VALOR_EXCEDIDO") &&
                                        n.getCriadaEm().toLocalDate().equals(LocalDate.now()));

                        if (!jaNotificado) {
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

    private void registrarExecucao(String nomeJob, String status, String mensagem, int quantidadeNotif, long tempoExecMs) {
        try {
            JobExecucao execucao = JobExecucao.builder()
                    .nomeJob(nomeJob)
                    .status(status)
                    .mensagem(mensagem)
                    .quantidadeNotif(quantidadeNotif)
                    .tempoExecMs(tempoExecMs)
                    .build();

            jobExecucaoRepository.save(execucao);
            log.info("✅ Execução registrada: {} ({}) - {} ms", nomeJob, status, tempoExecMs);

        } catch (Exception e) {
            log.error("❌ Erro ao registrar execução do job: {}", e.getMessage());
        }
    }
}
