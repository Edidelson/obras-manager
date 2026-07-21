package com.obramanager.domain.repository;

import com.obramanager.domain.entity.Etapa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EtapaRepository extends JpaRepository<Etapa, Long> {

    List<Etapa> findByObraIdOrderByOrdemAscIdAsc(Long obraId);

    Optional<Etapa> findByIdAndObraId(Long id, Long obraId);

    long countByObraId(Long obraId);
}
