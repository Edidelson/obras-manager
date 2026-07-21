package com.obramanager.domain.repository;

import com.obramanager.domain.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    // Produtos são compartilhados entre todos os usuários do app — não há
    // mais filtro por usuario_id. O campo `usuario` na entidade é mantido
    // apenas como registro de quem cadastrou (auditoria).
    @Query("""
        SELECT p FROM Produto p LEFT JOIN FETCH p.categoria
        WHERE p.ativo = true
        ORDER BY p.nome ASC
    """)
    List<Produto> findByAtivoTrueOrderByNomeAsc();

    @Query("""
        SELECT p FROM Produto p LEFT JOIN FETCH p.categoria
        WHERE p.id = :id
    """)
    Optional<Produto> buscarComCategoria(@Param("id") Long id);

    @Query("""
        SELECT p FROM Produto p LEFT JOIN FETCH p.categoria
        WHERE p.ativo = true
        AND LOWER(p.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
        ORDER BY p.nome ASC
    """)
    List<Produto> buscar(@Param("busca") String busca);

    @Query("""
        SELECT p FROM Produto p LEFT JOIN FETCH p.categoria
        WHERE p.categoria.id = :categoriaId AND p.ativo = true
    """)
    List<Produto> findByCategoriaIdAndAtivoTrue(@Param("categoriaId") Long categoriaId);
}
