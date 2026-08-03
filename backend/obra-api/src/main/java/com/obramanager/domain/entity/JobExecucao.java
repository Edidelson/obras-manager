package com.obramanager.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_execucoes")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class JobExecucao {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nomeJob;

    @Column(nullable = false, length = 20)
    private String status; // SUCESSO, ERRO

    @Column(columnDefinition = "TEXT")
    private String mensagem;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantidadeNotif = 0;

    @Column(name = "tempo_exec_ms")
    private Long tempoExecMs;

    @Column(name = "executado_em", updatable = false)
    private LocalDateTime executadoEm;

    @PrePersist
    void prePersist() {
        executadoEm = LocalDateTime.now();
    }
}
