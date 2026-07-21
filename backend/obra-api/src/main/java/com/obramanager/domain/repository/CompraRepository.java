package com.obramanager.domain.repository;

import com.obramanager.domain.entity.Compra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {

    List<Compra> findByObraIdOrderByDataCompraDesc(Long obraId);

    Optional<Compra> findByIdAndObraId(Long id, Long obraId);

    List<Compra> findByObraIdAndDataCompraBetweenOrderByDataCompraDesc(
            Long obraId, LocalDate inicio, LocalDate fim);

    @Query("""
        SELECT COALESCE(SUM(c.valorTotal), 0)
        FROM Compra c WHERE c.obra.id = :obraId
    """)
    BigDecimal totalGastoPorObra(@Param("obraId") Long obraId);

    @Query("""
        SELECT YEAR(c.dataCompra), MONTH(c.dataCompra), SUM(c.valorTotal)
        FROM Compra c
        WHERE c.obra.id = :obraId
        GROUP BY YEAR(c.dataCompra), MONTH(c.dataCompra)
        ORDER BY YEAR(c.dataCompra), MONTH(c.dataCompra)
    """)
    List<Object[]> gastosMensais(@Param("obraId") Long obraId);

    long countByObraId(Long obraId);

    @Query("""
        SELECT COALESCE(SUM(c.valorTotal), 0)
        FROM Compra c WHERE c.etapa.id = :etapaId
    """)
    BigDecimal totalGastoPorEtapa(@Param("etapaId") Long etapaId);

    @Query("""
        SELECT c.etapa.id, COALESCE(SUM(c.valorTotal), 0)
        FROM Compra c
        WHERE c.obra.id = :obraId AND c.etapa.id IS NOT NULL
        GROUP BY c.etapa.id
    """)
    List<Object[]> totalGastoPorEtapaDaObra(@Param("obraId") Long obraId);

    // Soma dos itens comprados na obra, agrupado pelo nome da categoria do
    // produto — usado pra comparar gasto real x planejado por categoria no
    // Orçamento. Produtos sem categoria ficam de fora (categoria opcional).
    @Query("""
        SELECT p.categoria.nome, COALESCE(SUM(i.valorTotal), 0)
        FROM Compra c JOIN c.itens i JOIN i.produto p
        WHERE c.obra.id = :obraId AND p.categoria IS NOT NULL
        GROUP BY p.categoria.nome
    """)
    List<Object[]> gastoPorCategoria(@Param("obraId") Long obraId);
}
