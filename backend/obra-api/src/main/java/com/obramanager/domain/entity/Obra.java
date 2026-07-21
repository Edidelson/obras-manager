package com.obramanager.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "obras")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Obra {

    public enum Status { PLANEJAMENTO, EM_ANDAMENTO, PAUSADA, CONCLUIDA, CANCELADA }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(length = 255)
    private String endereco;

    // Usada para filtrar fornecedores (compartilhados entre usuários) pela
    // cidade da obra. Ver FornecedorRepository/FornecedorController.
    @Column(length = 100)
    private String cidade;

    @Column(name = "valor_total_planejado", precision = 15, scale = 2)
    private BigDecimal valorTotalPlanejado;

    @Column(name = "data_inicio")
    private LocalDate dataInicio;

    @Column(name = "data_previsao")
    private LocalDate dataPrevisao;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.PLANEJAMENTO;

    @Column(name = "foto_capa_url")
    private String fotoCapa;

    @OneToMany(mappedBy = "obra", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Etapa> etapas = new ArrayList<>();

    @OneToMany(mappedBy = "obra", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Compra> compras = new ArrayList<>();

    @OneToOne(mappedBy = "obra", cascade = CascadeType.ALL, orphanRemoval = true)
    private Orcamento orcamento;

    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @PrePersist
    void prePersist() { criadoEm = LocalDateTime.now(); atualizadoEm = LocalDateTime.now(); }
    @PreUpdate
    void preUpdate() { atualizadoEm = LocalDateTime.now(); }
}
