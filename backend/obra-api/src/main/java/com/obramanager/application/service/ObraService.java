package com.obramanager.application.service;

import com.obramanager.application.dto.request.ObraRequest;
import com.obramanager.application.dto.response.DashboardResponse;
import com.obramanager.application.dto.response.ObraResponse;
import com.obramanager.domain.entity.Obra;
import com.obramanager.domain.entity.Orcamento;
import com.obramanager.domain.entity.Usuario;
import com.obramanager.domain.repository.CompraRepository;
import com.obramanager.domain.repository.FornecedorRepository;
import com.obramanager.domain.repository.ObraRepository;
import com.obramanager.domain.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ObraService {

    private final ObraRepository obraRepository;
    private final CompraRepository compraRepository;
    private final FornecedorRepository fornecedorRepository;
    private final ProdutoRepository produtoRepository;
    private final EtapaService etapaService;

    public List<ObraResponse> listarMinhas() {
        Long usuarioId = getUsuarioLogado().getId();
        return obraRepository.findByUsuarioIdOrderByAtualizadoEmDesc(usuarioId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public ObraResponse criar(ObraRequest req) {
        var usuario = getUsuarioLogado();
        var obra = Obra.builder()
                .usuario(usuario)
                .nome(req.nome())
                .descricao(req.descricao())
                .endereco(req.endereco())
                .cidade(req.cidade())
                .valorTotalPlanejado(req.valorTotalPlanejado())
                .dataInicio(req.dataInicio())
                .dataPrevisao(req.dataPrevisao())
                .build();
        var orcamento = Orcamento.builder()
                .obra(obra)
                .valorTotal(req.valorTotalPlanejado())
                .build();
        obra.setOrcamento(orcamento);
        obraRepository.save(obra);

        if (req.criarEtapasPadrao() == null || req.criarEtapasPadrao()) {
            etapaService.criarPadrao(obra);
        }

        return toResponse(obra);
    }

    public ObraResponse buscarPorId(Long id) {
        return toResponse(buscarObra(id));
    }

    @Transactional
    public ObraResponse atualizar(Long id, ObraRequest req) {
        var obra = buscarObra(id);
        obra.setNome(req.nome());
        obra.setDescricao(req.descricao());
        obra.setEndereco(req.endereco());
        obra.setCidade(req.cidade());
        obra.setValorTotalPlanejado(req.valorTotalPlanejado());
        obra.setDataInicio(req.dataInicio());
        obra.setDataPrevisao(req.dataPrevisao());
        return toResponse(obraRepository.save(obra));
    }

    @Transactional
    public void deletar(Long id) {
        obraRepository.delete(buscarObra(id));
    }

    public DashboardResponse getDashboard(Long obraId) {
        var obra = buscarObra(obraId);
        BigDecimal planejado = obra.getValorTotalPlanejado() != null
                ? obra.getValorTotalPlanejado() : BigDecimal.ZERO;
        BigDecimal gasto = compraRepository.totalGastoPorObra(obraId);
        BigDecimal restante = planejado.subtract(gasto);
        BigDecimal percentual = planejado.compareTo(BigDecimal.ZERO) > 0
                ? gasto.divide(planejado, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        // Fornecedores e produtos agora são compartilhados entre usuários, então
        // a contagem no dashboard reflete o catálogo inteiro, não só o do usuário.
        long totalCompras = compraRepository.countByObraId(obraId);
        long totalFornecedores = fornecedorRepository.findByAtivoTrueOrderByNomeAsc().size();
        long totalProdutos = produtoRepository.findByAtivoTrueOrderByNomeAsc().size();

        return new DashboardResponse(
                planejado, gasto, restante, percentual,
                totalCompras, totalFornecedores, totalProdutos,
                compraRepository.gastosMensais(obraId)
        );
    }

    private Obra buscarObra(Long id) {
        Long usuarioId = getUsuarioLogado().getId();
        return obraRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Obra não encontrada."));
    }

    private Usuario getUsuarioLogado() {
        return (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private ObraResponse toResponse(Obra o) {
        return new ObraResponse(o.getId(), o.getNome(), o.getDescricao(),
                o.getEndereco(), o.getCidade(), o.getValorTotalPlanejado(),
                o.getDataInicio(), o.getDataPrevisao(), o.getStatus().name(), o.getFotoCapa());
    }
}
