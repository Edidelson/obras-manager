package com.obramanager.infrastructure.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    /**
     * Envia email simples
     */
    public void enviar(String para, String assunto, String mensagem) {
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(from);
            email.setTo(para);
            email.setSubject(assunto);
            email.setText(mensagem);

            mailSender.send(email);
            log.info("✉️ Email enviado para: {}", para);

        } catch (Exception e) {
            log.error("❌ Erro ao enviar email para {}: {}", para, e.getMessage());
        }
    }

    /**
     * Envia notificação de obra atrasada
     */
    public void notificacaoObraAtrasada(String email, String nomeObra, int diasAtrasado) {
        String assunto = "⏰ Obra Atrasada: " + nomeObra;
        String mensagem = String.format(
                "Sua obra '%s' está %d dias atrasada!\n\n" +
                "Acesse o app para ver detalhes.",
                nomeObra, diasAtrasado
        );
        enviar(email, assunto, mensagem);
    }

    /**
     * Envia notificação de valor excedido
     */
    public void notificacaoValorExcedido(String email, String nomeObra, double orçado, double gasto) {
        String assunto = "💰 Orçamento Excedido: " + nomeObra;
        String mensagem = String.format(
                "O orçamento de '%s' foi excedido!\n\n" +
                "Orçado: R$ %.2f\n" +
                "Gasto: R$ %.2f\n\n" +
                "Acesse o app para ajustar.",
                nomeObra, orçado, gasto
        );
        enviar(email, assunto, mensagem);
    }

    /**
     * Envia notificação de produto faltando
     */
    public void notificacaoProdutoFaltando(String email, String nomeObra, String nomeProduto) {
        String assunto = "📦 Produto Faltando: " + nomeObra;
        String mensagem = String.format(
                "O produto '%s' ainda não foi comprado para a obra '%s'.\n\n" +
                "Acesse o app para fazer a compra.",
                nomeProduto, nomeObra
        );
        enviar(email, assunto, mensagem);
    }
}
