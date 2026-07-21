package com.obramanager.domain.repository;

import com.obramanager.domain.entity.Fornecedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FornecedorRepository extends JpaRepository<Fornecedor, Long> {

    // Fornecedores são compartilhados entre todos os usuários do app — não há
    // mais filtro por usuario_id. O campo `usuario` na entidade é mantido
    // apenas como registro de quem cadastrou (auditoria).
    List<Fornecedor> findByAtivoTrueOrderByNomeAsc();

    @Query("""
        SELECT f FROM Fornecedor f
        WHERE f.ativo = true
        AND LOWER(f.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
        ORDER BY f.nome ASC
    """)
    List<Fornecedor> buscar(@Param("busca") String busca);

    // Filtra fornecedores pela cidade da obra ativa (ver FornecedorController),
    // já que agora são compartilhados entre todos os usuários.
    @Query("""
        SELECT f FROM Fornecedor f
        WHERE f.ativo = true AND LOWER(f.cidade) = LOWER(:cidade)
        ORDER BY f.nome ASC
    """)
    List<Fornecedor> findByCidadeIgnoreCase(@Param("cidade") String cidade);

    @Query("""
        SELECT f FROM Fornecedor f
        WHERE f.ativo = true AND LOWER(f.cidade) = LOWER(:cidade)
        AND LOWER(f.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
        ORDER BY f.nome ASC
    """)
    List<Fornecedor> buscarPorCidade(@Param("cidade") String cidade, @Param("busca") String busca);

    @Query("""
        SELECT f, COUNT(c) as totalCompras
        FROM Fornecedor f
        LEFT JOIN Compra c ON c.fornecedor.id = f.id
        WHERE f.ativo = true
        GROUP BY f
        ORDER BY totalCompras DESC, f.avaliacao DESC
    """)
    List<Object[]> ranking();
}
