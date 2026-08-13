package com.obramanager.domain.repository;

import com.obramanager.domain.entity.JobExecucao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobExecucaoRepository extends JpaRepository<JobExecucao, String> {

    /** Cada job possui exatamente uma linha. */
    Optional<JobExecucao> findByNomeJob(String nomeJob);

    List<JobExecucao> findAllByOrderByNomeJobAsc();
}
