package com.obramanager.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "etapas")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Etapa {

    public enum Status { AGUARDANDO, EM_ANDAMENTO, PAUSADA, CONCLUIDA }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "obra_id", nullable = false)
    private Obra obra;

    @Column(nullable = false, length = 100)
    private String nome;

    private Integer ordem;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.AGUARDANDO;

    @Column(name = "percentual_concluido", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal percentualConcluido = BigDecimal.ZERO;

    // Quando preenchido, o percentualConcluido passa a ser calculado
    // automaticamente (valor gasto em compras desta etapa / valorOrcado),
    // em vez de exigir atualização manual. Ver EtapaService.toResponse().
    @Column(name = "valor_orcado", precision = 15, scale = 2)
    private BigDecimal valorOrcado;

    @Column(name = "data_inicio")
    private LocalDate dataInicio;

    @Column(name = "data_previsao")
    private LocalDate dataPrevisao;

    @Column(name = "data_conclusao")
    private LocalDate dataConclusao;

    @Column(columnDefinition = "TEXT")
    private String observacoes;
}
