package com.obramanager.domain.repository;

import com.obramanager.domain.entity.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    @Query("""
        SELECT n FROM Notificacao n
        WHERE n.obra.id = :obraId
        ORDER BY n.criadaEm DESC
    """)
    List<Notificacao> findByObraId(@Param("obraId") Long obraId);

    @Query("""
        SELECT n FROM Notificacao n
        WHERE n.obra.id = :obraId AND n.lida = false
        ORDER BY n.criadaEm DESC
    """)
    List<Notificacao> findByObraIdAndNaoLida(@Param("obraId") Long obraId);

    @Query("""
        SELECT COUNT(n) FROM Notificacao n
        WHERE n.obra.id = :obraId AND n.lida = false
    """)
    long countNaoLidas(@Param("obraId") Long obraId);
}
