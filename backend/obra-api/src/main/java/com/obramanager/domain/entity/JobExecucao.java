package com.obramanager.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "job_execucoes")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class JobExecucao {

    /** Chave primária: existe apenas UMA linha por job. */
    @Id
    @Column(name = "nome_job", nullable = false, length = 100)
    private String nomeJob;

    @Column(nullable = false, length = 20)
    private String status; // SUCESSO, ERRO, PENDENTE

    @Column(name = "quantidade_notif", nullable = false)
    @Builder.Default
    private Integer quantidadeNotif = 0;

    @Column(name = "executado_em")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime executadoEm;

    @Column(name = "proxima_exec")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime proximaExec;

    @PrePersist
    @PreUpdate
    void normalizarHorarios() {
        // Trunca para segundos apenas (remove milissegundos/nanosegundos)
        if (executadoEm != null) {
            executadoEm = executadoEm.truncatedTo(ChronoUnit.SECONDS);
        }
        if (proximaExec != null) {
            proximaExec = proximaExec.truncatedTo(ChronoUnit.SECONDS);
        }
    }
}
