package com.obramanager.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "cotacoes")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Cotacao {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fornecedor_id", nullable = false)
    private Fornecedor fornecedor;

    @Column(name = "preco_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal precoUnitario;

    @Column(name = "data_cotacao")
    private LocalDate dataCotacao;

    @Column(name = "validade")
    private LocalDate validade;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Builder.Default
    private boolean ativa = true;
}
