package com.obramanager.domain.repository;

import com.obramanager.domain.entity.JobExecucao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JobExecucaoRepository extends JpaRepository<JobExecucao, Long> {

    @Query("""
        SELECT j FROM JobExecucao j
        WHERE j.nomeJob = :nomeJob
        ORDER BY j.executadoEm DESC
    """)
    List<JobExecucao> findByNomeJob(@Param("nomeJob") String nomeJob);

    @Query("""
        SELECT j FROM JobExecucao j
        WHERE j.executadoEm >= :desde
        ORDER BY j.executadoEm DESC
    """)
    List<JobExecucao> findUltimos(@Param("desde") LocalDateTime desde);

    @Query("""
        SELECT j FROM JobExecucao j
        ORDER BY j.executadoEm DESC
        LIMIT 50
    """)
    List<JobExecucao> findUltimas50();
}
