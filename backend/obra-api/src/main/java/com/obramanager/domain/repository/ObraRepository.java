package com.obramanager.domain.repository;

import com.obramanager.domain.entity.Obra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ObraRepository extends JpaRepository<Obra, Long> {

    List<Obra> findByUsuarioIdOrderByAtualizadoEmDesc(Long usuarioId);

    Optional<Obra> findByIdAndUsuarioId(Long id, Long usuarioId);

    @Query("""
        SELECT COALESCE(SUM(c.valorTotal), 0)
        FROM Compra c WHERE c.obra.id = :obraId
    """)
    java.math.BigDecimal calcularTotalGasto(@Param("obraId") Long obraId);
}
