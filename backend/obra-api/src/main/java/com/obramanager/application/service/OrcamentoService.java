package com.obramanager.application.service;

import com.obramanager.application.dto.request.OrcamentoRequest;
import com.obramanager.application.dto.response.OrcamentoResponse;
import com.obramanager.domain.entity.Obra;
import com.obramanager.domain.entity.Orcamento;
import com.obramanager.domain.entity.Usuario;
import com.obramanager.domain.repository.CompraRepository;
import com.obramanager.domain.repository.ObraRepository;
import com.obramanager.domain.repository.OrcamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrcamentoService {

    // Nomes das categorias "padrão" (ver V1__schema_inicial.sql) que mapeiam
    // 1:1 pros buckets fixos do orçamento. Categorias extras cadastradas pelo
    // usuário (ex: "Cobertura", "Ferramentas") não entram nesse breakdown —
    // só as 5 que têm um bucket correspondente na tabela orcamentos.
    private static final String CAT_MATERIAIS = "Materiais";
    private static final String CAT_MAO_OBRA = "Mão de Obra";
    private static final String CAT_ELETRICA = "Elétrica";
    private static final String CAT_HIDRAULICA = "Hidráulica";
    private static final String CAT_ACABAMENTO = "Acabamento";

    private final OrcamentoRepository orcamentoRepository;
    private final ObraRepository obraRepository;
    private final CompraRepository compraRepository;

    public OrcamentoResponse buscar(Long obraId) {
        var obra = buscarObra(obraId);
        var orcamento = buscarOuCriarOrcamento(obra);
        var gastoPorCategoria = calcularGastoPorCategoria(obraId);
        return toResponse(orcamento, gastoPorCategoria);
    }

    @Transactional
    public OrcamentoResponse atualizar(Long obraId, OrcamentoRequest req) {
        var obra = buscarObra(obraId);
        var orcamento = buscarOuCriarOrcamento(obra);

        orcamento.setValorTotal(req.valorTotal());
        orcamento.setMatMateriais(req.matMateriais());
        orcamento.setMatMaoObra(req.matMaoObra());
        orcamento.setMatEletrica(req.matEletrica());
        orcamento.setMatHidraulica(req.matHidraulica());
        orcamento.setMatAcabamento(req.matAcabamento());
        orcamentoRepository.save(orcamento);

        var gastoPorCategoria = calcularGastoPorCategoria(obraId);
        return toResponse(orcamento, gastoPorCategoria);
    }

    private Orcamento buscarOuCriarOrcamento(Obra obra) {
        return orcamentoRepository.findByObraId(obra.getId()).orElseGet(() -> {
            var novo = Orcamento.builder()
                    .obra(obra)
                    .valorTotal(obra.getValorTotalPlanejado() != null ? obra.getValorTotalPlanejado() : BigDecimal.ZERO)
                    .build();
            return orcamentoRepository.save(novo);
        });
    }

    private Map<String, BigDecimal> calcularGastoPorCategoria(Long obraId) {
        Map<String, BigDecimal> mapa = new HashMap<>();
        for (Object[] linha : compraRepository.gastoPorCategoria(obraId)) {
            mapa.put((String) linha[0], (BigDecimal) linha[1]);
        }
        return mapa;
    }

    private Obra buscarObra(Long obraId) {
        Long usuarioId = getUsuarioLogado().getId();
        return obraRepository.findByIdAndUsuarioId(obraId, usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Obra não encontrada."));
    }

    private Usuario getUsuarioLogado() {
        return (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private OrcamentoResponse toResponse(Orcamento o, Map<String, BigDecimal> gasto) {
        return new OrcamentoResponse(
                o.getValorTotal(),
                o.getMatMateriais(),
                o.getMatMaoObra(),
                o.getMatEletrica(),
                o.getMatHidraulica(),
                o.getMatAcabamento(),
                gasto.getOrDefault(CAT_MATERIAIS, BigDecimal.ZERO),
                gasto.getOrDefault(CAT_MAO_OBRA, BigDecimal.ZERO),
                gasto.getOrDefault(CAT_ELETRICA, BigDecimal.ZERO),
                gasto.getOrDefault(CAT_HIDRAULICA, BigDecimal.ZERO),
                gasto.getOrDefault(CAT_ACABAMENTO, BigDecimal.ZERO)
        );
    }
}
