package com.obramanager.application.service;

import com.obramanager.application.dto.request.CompraRequest;
import com.obramanager.application.dto.request.ItemCompraRequest;
import com.obramanager.application.dto.response.CompraResponse;
import com.obramanager.application.dto.response.ItemCompraResponse;
import com.obramanager.domain.entity.*;
import com.obramanager.domain.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompraService {

    private final CompraRepository compraRepository;
    private final ObraRepository obraRepository;
    private final FornecedorRepository fornecedorRepository;
    private final ProdutoRepository produtoRepository;
    private final EtapaRepository etapaRepository;

    public List<CompraResponse> listar(Long obraId) {
        buscarObra(obraId);
        return compraRepository.findByObraIdOrderByDataCompraDesc(obraId)
                .stream().map(this::toResponse).toList();
    }

    public CompraResponse buscar(Long obraId, Long id) {
        buscarObra(obraId);
        var compra = compraRepository.findByIdAndObraId(id, obraId)
                .orElseThrow(() -> new IllegalArgumentException("Compra não encontrada."));
        return toResponse(compra);
    }

    @Transactional
    public CompraResponse criar(Long obraId, CompraRequest req) {
        var obra = buscarObra(obraId);

        Fornecedor fornecedor = null;
        if (req.fornecedorId() != null) {
            fornecedor = fornecedorRepository.findById(req.fornecedorId())
                    .orElseThrow(() -> new IllegalArgumentException("Fornecedor não encontrado."));
        }

        Etapa etapa = null;
        if (req.etapaId() != null) {
            etapa = etapaRepository.findByIdAndObraId(req.etapaId(), obraId)
                    .orElseThrow(() -> new IllegalArgumentException("Etapa não encontrada."));
        }

        var compra = Compra.builder()
                .obra(obra)
                .fornecedor(fornecedor)
                .etapa(etapa)
                .dataCompra(req.dataCompra())
                .numeroNf(req.numeroNf())
                .observacoes(req.observacoes())
                .build();

        for (ItemCompraRequest itemReq : req.itens()) {
            var produto = produtoRepository.findById(itemReq.produtoId())
                    .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado."));

            var item = ItemCompra.builder()
                    .compra(compra)
                    .produto(produto)
                    .quantidade(itemReq.quantidade())
                    .valorUnitario(itemReq.valorUnitario())
                    .valorTotal(itemReq.quantidade().multiply(itemReq.valorUnitario()))
                    .unidade(itemReq.unidade() != null ? itemReq.unidade() : produto.getUnidade())
                    .build();
            compra.getItens().add(item);

            atualizarEstoqueProduto(produto, itemReq.quantidade(), itemReq.valorUnitario());
            produtoRepository.save(produto);
        }

        compra.calcularTotal();
        compraRepository.save(compra);
        return toResponse(compra);
    }

    @Transactional
    public void deletar(Long obraId, Long id) {
        buscarObra(obraId);
        var compra = compraRepository.findByIdAndObraId(id, obraId)
                .orElseThrow(() -> new IllegalArgumentException("Compra não encontrada."));
        compraRepository.delete(compra);
    }

    private void atualizarEstoqueProduto(Produto produto, BigDecimal quantidade, BigDecimal valorUnitario) {
        BigDecimal qtdAnterior = produto.getQuantidadeComprada() != null ? produto.getQuantidadeComprada() : BigDecimal.ZERO;
        BigDecimal precoAnterior = produto.getPrecoMedio() != null ? produto.getPrecoMedio() : BigDecimal.ZERO;

        BigDecimal qtdNova = qtdAnterior.add(quantidade);
        BigDecimal totalAnterior = precoAnterior.multiply(qtdAnterior);
        BigDecimal totalNovo = valorUnitario.multiply(quantidade);
        BigDecimal precoMedioNovo = qtdNova.compareTo(BigDecimal.ZERO) > 0
                ? totalAnterior.add(totalNovo).divide(qtdNova, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        produto.setQuantidadeComprada(qtdNova);
        produto.setPrecoMedio(precoMedioNovo);
    }

    private Obra buscarObra(Long obraId) {
        Long usuarioId = getUsuarioLogado().getId();
        return obraRepository.findByIdAndUsuarioId(obraId, usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Obra não encontrada."));
    }

    private Usuario getUsuarioLogado() {
        return (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private CompraResponse toResponse(Compra c) {
        var itens = c.getItens().stream().map(i -> new ItemCompraResponse(
                i.getId(),
                new ItemCompraResponse.ProdutoMini(i.getProduto().getId(), i.getProduto().getNome()),
                i.getQuantidade(),
                i.getValorUnitario(),
                i.getValorTotal(),
                i.getUnidade()
        )).toList();

        var fornecedorMini = c.getFornecedor() != null
                ? new CompraResponse.FornecedorMini(c.getFornecedor().getId(), c.getFornecedor().getNome(), c.getFornecedor().getCidade())
                : null;

        var etapaMini = c.getEtapa() != null
                ? new CompraResponse.EtapaMini(c.getEtapa().getId(), c.getEtapa().getNome())
                : null;

        return new CompraResponse(
                c.getId(),
                fornecedorMini,
                etapaMini,
                c.getDataCompra(),
                c.getValorTotal(),
                c.getNumeroNf(),
                c.getObservacoes(),
                itens
        );
    }
}
