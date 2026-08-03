package com.obramanager.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificacoes")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Notificacao {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "obra_id", nullable = false)
    private Obra obra;

    @Column(nullable = false, length = 50)
    private String tipo; // ATRASADA, VALOR_EXCEDIDO, PRODUTO_FALTANDO

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String mensagem;

    @Column(nullable = false)
    @Builder.Default
    private boolean lida = false;

    @Column(name = "criada_em", updatable = false)
    private LocalDateTime criadaEm;

    @Column(name = "atualizada_em")
    private LocalDateTime atualizadaEm;

    @PrePersist
    void prePersist() {
        criadaEm = LocalDateTime.now();
        atualizadaEm = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        atualizadaEm = LocalDateTime.now();
    }
}
