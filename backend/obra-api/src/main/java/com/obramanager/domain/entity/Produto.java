package com.obramanager.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "produtos")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Produto {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(length = 20)
    private String unidade;

    @Column(name = "quantidade_planejada", precision = 12, scale = 3)
    @Builder.Default
    private BigDecimal quantidadePlanejada = BigDecimal.ZERO;

    @Column(name = "quantidade_comprada", precision = 12, scale = 3)
    @Builder.Default
    private BigDecimal quantidadeComprada = BigDecimal.ZERO;

    @Column(name = "preco_medio", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal precoMedio = BigDecimal.ZERO;

    @Builder.Default
    private boolean ativo = true;

    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Cotacao> cotacoes = new ArrayList<>();

    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @PrePersist
    void prePersist() { criadoEm = LocalDateTime.now(); atualizadoEm = LocalDateTime.now(); }
    @PreUpdate
    void preUpdate() { atualizadoEm = LocalDateTime.now(); }
}
