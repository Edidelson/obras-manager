package com.obramanager.application.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        BigDecimal valorPlanejado,
        BigDecimal valorGasto,
        BigDecimal valorRestante,
        BigDecimal percentualConsumido,
        long totalCompras,
        long totalFornecedores,
        long totalProdutos,
        List<Object[]> gastosMensais
) {}
