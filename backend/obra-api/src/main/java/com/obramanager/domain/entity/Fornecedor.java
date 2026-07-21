package com.obramanager.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fornecedores")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Fornecedor {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(length = 20)
    private String telefone;

    @Column(length = 20)
    private String whatsapp;

    @Column(length = 255)
    private String email;

    @Column(length = 100)
    private String cidade;

    @Column(precision = 3, scale = 1)
    @Builder.Default
    private BigDecimal avaliacao = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Builder.Default
    private boolean ativo = true;

    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @PrePersist
    void prePersist() { criadoEm = LocalDateTime.now(); atualizadoEm = LocalDateTime.now(); }
    @PreUpdate
    void preUpdate() { atualizadoEm = LocalDateTime.now(); }
}
