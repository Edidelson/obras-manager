package com.obramanager.application.service;

import com.obramanager.application.dto.request.EtapaRequest;
import com.obramanager.application.dto.response.EtapaResponse;
import com.obramanager.domain.entity.Etapa;
import com.obramanager.domain.entity.Obra;
import com.obramanager.domain.entity.Usuario;
import com.obramanager.domain.repository.CompraRepository;
import com.obramanager.domain.repository.EtapaRepository;
import com.obramanager.domain.repository.ObraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EtapaService {

    // Mesmas 5 categorias usadas no Orçamento (ver Orcamento.java /
    // OrcamentoService), pra manter etapas e orçamento alinhados. Usada pra
    // já popular a obra ao criá-la (ver criarPadrao); o usuário pode editar,
    // completar ou cadastrar etapas extras depois.
    private static final List<String> ETAPAS_PADRAO = List.of(
            "Materiais",
            "Mão de Obra",
            "Elétrica",
            "Hidráulica",
            "Acabamento"
    );

    private final EtapaRepository etapaRepository;
    private final ObraRepository obraRepository;
    private final CompraRepository compraRepository;

    @Transactional
    public void criarPadrao(Obra obra) {
        int ordem = 0;
        for (String nome : ETAPAS_PADRAO) {
            etapaRepository.save(Etapa.builder()
                    .obra(obra)
                    .nome(nome)
                    .ordem(ordem++)
                    .status(Etapa.Status.AGUARDANDO)
                    .percentualConcluido(BigDecimal.ZERO)
                    .build());
        }
    }

    public List<EtapaResponse> listar(Long obraId) {
        buscarObra(obraId);
        var etapas = etapaRepository.findByObraIdOrderByOrdemAscIdAsc(obraId);

        Map<Long, BigDecimal> gastoPorEtapa = compraRepository.totalGastoPorEtapaDaObra(obraId).stream()
                .collect(Collectors.toMap(row -> (Long) row[0], row -> (BigDecimal) row[1]));

        return etapas.stream().map(e -> toResponse(e, gastoPorEtapa)).toList();
    }

    @Transactional
    public EtapaResponse criar(Long obraId, EtapaRequest req) {
        var obra = buscarObra(obraId);

        var etapa = Etapa.builder()
                .obra(obra)
                .nome(req.nome())
                .ordem(req.ordem() != null ? req.ordem() : proximaOrdem(obraId))
                .status(req.status() != null ? req.status() : Etapa.Status.AGUARDANDO)
                .percentualConcluido(req.percentualConcluido() != null ? req.percentualConcluido() : BigDecimal.ZERO)
                .dataInicio(req.dataInicio())
                .dataPrevisao(req.dataPrevisao())
                .dataConclusao(req.dataConclusao())
                .observacoes(req.observacoes())
                .valorOrcado(req.valorOrcado())
                .build();

        etapaRepository.save(etapa);
        return toResponse(etapa, null);
    }

    @Transactional
    public EtapaResponse atualizar(Long obraId, Long id, EtapaRequest req) {
        buscarObra(obraId);
        var etapa = buscarEtapa(obraId, id);

        etapa.setNome(req.nome());
        if (req.ordem() != null) etapa.setOrdem(req.ordem());
        if (req.status() != null) etapa.setStatus(req.status());
        if (req.percentualConcluido() != null) etapa.setPercentualConcluido(req.percentualConcluido());
        etapa.setDataInicio(req.dataInicio());
        etapa.setDataPrevisao(req.dataPrevisao());
        etapa.setDataConclusao(req.dataConclusao());
        etapa.setObservacoes(req.observacoes());
        etapa.setValorOrcado(req.valorOrcado());

        etapaRepository.save(etapa);
        return toResponse(etapa, null);
    }

    @Transactional
    public void deletar(Long obraId, Long id) {
        buscarObra(obraId);
        var etapa = buscarEtapa(obraId, id);
        etapaRepository.delete(etapa);
    }

    private int proximaOrdem(Long obraId) {
        return (int) etapaRepository.countByObraId(obraId);
    }

    private Etapa buscarEtapa(Long obraId, Long id) {
        return etapaRepository.findByIdAndObraId(id, obraId)
                .orElseThrow(() -> new IllegalArgumentException("Etapa não encontrada."));
    }

    private Obra buscarObra(Long obraId) {
        Long usuarioId = getUsuarioLogado().getId();
        return obraRepository.findByIdAndUsuarioId(obraId, usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Obra não encontrada."));
    }

    private Usuario getUsuarioLogado() {
        return (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // Quando a etapa tem valorOrcado definido, percentual e status passam a
    // ser calculados a partir do total gasto em compras vinculadas a ela
    // (em vez do valor manual salvo no banco). `gastoPorEtapa`, quando
    // informado (uso em listar()), evita uma query por etapa; quando null
    // (uso em criar/atualizar, etapa única), consulta direto o repositório.
    private EtapaResponse toResponse(Etapa e, Map<Long, BigDecimal> gastoPorEtapa) {
        BigDecimal percentual = e.getPercentualConcluido();
        Etapa.Status status = e.getStatus();
        BigDecimal gasto = null;

        if (e.getValorOrcado() != null && e.getValorOrcado().compareTo(BigDecimal.ZERO) > 0) {
            gasto = gastoPorEtapa != null
                    ? gastoPorEtapa.getOrDefault(e.getId(), BigDecimal.ZERO)
                    : compraRepository.totalGastoPorEtapa(e.getId());

            percentual = gasto.multiply(BigDecimal.valueOf(100))
                    .divide(e.getValorOrcado(), 2, RoundingMode.HALF_UP);
            if (percentual.compareTo(BigDecimal.valueOf(100)) > 0) {
                percentual = BigDecimal.valueOf(100);
            }

            status = percentual.compareTo(BigDecimal.valueOf(100)) == 0 ? Etapa.Status.CONCLUIDA
                    : percentual.compareTo(BigDecimal.ZERO) > 0 ? Etapa.Status.EM_ANDAMENTO
                    : Etapa.Status.AGUARDANDO;
        }

        return new EtapaResponse(
                e.getId(),
                e.getNome(),
                e.getOrdem(),
                status,
                percentual,
                e.getDataInicio(),
                e.getDataPrevisao(),
                e.getDataConclusao(),
                e.getObservacoes(),
                e.getValorOrcado(),
                gasto
        );
    }
}
