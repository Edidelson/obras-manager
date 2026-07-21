package com.obramanager.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orcamentos")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Orcamento {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "obra_id", nullable = false, unique = true)
    private Obra obra;

    @Column(name = "valor_total", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal valorTotal = BigDecimal.ZERO;

    @Column(name = "mat_materiais", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal matMateriais = BigDecimal.ZERO;

    @Column(name = "mat_mao_obra", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal matMaoObra = BigDecimal.ZERO;

    @Column(name = "mat_eletrica", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal matEletrica = BigDecimal.ZERO;

    @Column(name = "mat_hidraulica", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal matHidraulica = BigDecimal.ZERO;

    @Column(name = "mat_acabamento", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal matAcabamento = BigDecimal.ZERO;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @PrePersist @PreUpdate
    void preUpdate() { atualizadoEm = LocalDateTime.now(); }
}
