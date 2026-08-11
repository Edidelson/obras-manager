package com.obramanager.domain.entity;

import java.io.Serializable;
import java.time.LocalTime;
import java.util.Objects;

public class JobExecucaoPK implements Serializable {
    private String nomeJob;
    private LocalTime executadoEm;

    public JobExecucaoPK() {}

    public JobExecucaoPK(String nomeJob, LocalTime executadoEm) {
        this.nomeJob = nomeJob;
        this.executadoEm = executadoEm;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        JobExecucaoPK that = (JobExecucaoPK) o;
        return Objects.equals(nomeJob, that.nomeJob) &&
                Objects.equals(executadoEm, that.executadoEm);
    }

    @Override
    public int hashCode() {
        return Objects.hash(nomeJob, executadoEm);
    }
}
