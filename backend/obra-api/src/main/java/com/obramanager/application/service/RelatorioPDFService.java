package com.obramanager.application.service;

import com.obramanager.domain.entity.Obra;
import com.obramanager.domain.entity.Orcamento;
import com.obramanager.domain.repository.ObraRepository;
import com.obramanager.domain.repository.OrcamentoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RelatorioPDFService {

    private final ObraRepository obraRepository;
    private final OrcamentoRepository orcamentoRepository;

    /**
     * Prepara dados para gerar relatório PDF
     */
    public Map<String, Object> gerarDadosRelatorio(Long obraId) {
        Obra obra = obraRepository.findById(obraId)
                .orElseThrow(() -> new IllegalArgumentException("Obra não encontrada."));

        Orcamento orcamento = orcamentoRepository.findByObraId(obraId)
                .orElse(null);

        Map<String, Object> dados = new HashMap<>();
        dados.put("nomeObra", obra.getNome());
        dados.put("descricao", obra.getDescricao());
        dados.put("endereco", obra.getEndereco());
        dados.put("dataInicio", obra.getDataInicio());
        dados.put("dataPrevisao", obra.getDataPrevisao());
        dados.put("status", obra.getStatus());
        dados.put("valorTotalPlanejado", obra.getValorTotalPlanejado());
        dados.put("dataPDF", java.time.LocalDate.now().toString());

        if (orcamento != null) {
            dados.put("valorTotal", orcamento.getValorTotal());
            dados.put("matMateriais", orcamento.getMatMateriais());
            dados.put("matMaoObra", orcamento.getMatMaoObra());
            dados.put("matEletrica", orcamento.getMatEletrica());
            dados.put("matHidraulica", orcamento.getMatHidraulica());
            dados.put("matAcabamento", orcamento.getMatAcabamento());
        }

        log.info("📊 Dados do relatório gerados para obra: {}", obra.getNome());
        return dados;
    }
}
