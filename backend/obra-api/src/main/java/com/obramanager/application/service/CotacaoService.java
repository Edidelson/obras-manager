package com.obramanager.application.service;

import com.obramanager.application.dto.request.CotacaoRequest;
import com.obramanager.application.dto.response.CotacaoResponse;
import com.obramanager.domain.entity.Cotacao;
import com.obramanager.domain.entity.Fornecedor;
import com.obramanager.domain.entity.Produto;
import com.obramanager.domain.repository.CotacaoRepository;
import com.obramanager.domain.repository.FornecedorRepository;
import com.obramanager.domain.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CotacaoService {

    private final CotacaoRepository cotacaoRepository;
    private final ProdutoRepository produtoRepository;
    private final FornecedorRepository fornecedorRepository;

    public List<CotacaoResponse> listarPorProduto(Long produtoId) {
        var cotacoes = cotacaoRepository.findByProdutoIdOrdenadoPorPreco(produtoId);
        BigDecimal menorPreco = cotacoes.isEmpty() ? BigDecimal.ZERO
                : cotacoes.get(0).getPrecoUnitario();

        return cotacoes.stream().map(c -> {
            BigDecimal diferenca = c.getPrecoUnitario().subtract(menorPreco);
            boolean eMenorPreco = c.getPrecoUnitario().compareTo(menorPreco) == 0;
            return new CotacaoResponse(
                    c.getId(),
                    c.getFornecedor().getId(),
                    c.getFornecedor().getNome(),
                    c.getFornecedor().getCidade(),
                    c.getPrecoUnitario(),
                    c.getDataCotacao(),
                    c.getValidade(),
                    eMenorPreco,
                    diferenca
            );
        }).toList();
    }

    @Transactional
    public CotacaoResponse adicionar(Long produtoId, CotacaoRequest req) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado."));
        Fornecedor fornecedor = fornecedorRepository.findById(req.fornecedorId())
                .orElseThrow(() -> new IllegalArgumentException("Fornecedor não encontrado."));

        var cotacao = Cotacao.builder()
                .produto(produto)
                .fornecedor(fornecedor)
                .precoUnitario(req.precoUnitario())
                .dataCotacao(req.dataCotacao())
                .validade(req.validade())
                .observacoes(req.observacoes())
                .build();
        cotacaoRepository.save(cotacao);

        return new CotacaoResponse(cotacao.getId(), fornecedor.getId(), fornecedor.getNome(), fornecedor.getCidade(),
                cotacao.getPrecoUnitario(), cotacao.getDataCotacao(), cotacao.getValidade(),
                false, BigDecimal.ZERO);
    }

    @Transactional
    public void deletar(Long id) {
        cotacaoRepository.findById(id).ifPresent(c -> {
            c.setAtiva(false);
            cotacaoRepository.save(c);
        });
    }
}
