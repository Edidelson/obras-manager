package com.obramanager.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "job_execucoes")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@IdClass(JobExecucaoPK.class)
public class JobExecucao {

    @Id
    @Column(nullable = false, length = 100)
    private String nomeJob;

    @Column(nullable = false, length = 20)
    private String status; // SUCESSO, ERRO

    @Column(nullable = false)
    @Builder.Default
    private Integer quantidadeNotif = 0;

    @Id
    @Column(name = "executado_em", updatable = false)
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime executadoEm;

    @Column(name = "proxima_exec")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime proximaExec;

    @PrePersist
    void prePersist() {
        if (executadoEm == null) {
            executadoEm = LocalTime.now();
        }
        // Trunca para segundos apenas (remove milissegundos/nanosegundos)
        executadoEm = executadoEm.truncatedTo(ChronoUnit.SECONDS);
        if (proximaExec != null) {
            proximaExec = proximaExec.truncatedTo(ChronoUnit.SECONDS);
        }
    }
}
