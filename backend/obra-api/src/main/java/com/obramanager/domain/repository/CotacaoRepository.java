package com.obramanager.domain.repository;

import com.obramanager.domain.entity.Cotacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CotacaoRepository extends JpaRepository<Cotacao, Long> {

    List<Cotacao> findByProdutoIdAndAtivaTrue(Long produtoId);

    @Query("""
        SELECT c FROM Cotacao c
        WHERE c.produto.id = :produtoId AND c.ativa = true
        ORDER BY c.precoUnitario ASC
    """)
    List<Cotacao> findByProdutoIdOrdenadoPorPreco(@Param("produtoId") Long produtoId);

    @Query("""
        SELECT c FROM Cotacao c
        WHERE c.produto.id = :produtoId AND c.ativa = true
        ORDER BY c.precoUnitario ASC
        LIMIT 1
    """)
    Optional<Cotacao> findMenorPrecoPorProduto(@Param("produtoId") Long produtoId);
}
