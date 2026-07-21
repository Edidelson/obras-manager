package com.obramanager.api.controller;

import com.obramanager.application.dto.request.ObraRequest;
import com.obramanager.application.dto.request.OrcamentoRequest;
import com.obramanager.application.dto.response.DashboardResponse;
import com.obramanager.application.dto.response.ObraResponse;
import com.obramanager.application.dto.response.OrcamentoResponse;
import com.obramanager.application.service.ObraService;
import com.obramanager.application.service.OrcamentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/obras")
@RequiredArgsConstructor
@Tag(name = "Obras")
@SecurityRequirement(name = "bearerAuth")
public class ObraController {

    private final ObraService obraService;
    private final OrcamentoService orcamentoService;

    @GetMapping
    @Operation(summary = "Listar obras do usuário logado")
    public List<ObraResponse> listar() {
        return obraService.listarMinhas();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar nova obra")
    public ObraResponse criar(@Valid @RequestBody ObraRequest req) {
        return obraService.criar(req);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalhe da obra")
    public ObraResponse buscar(@PathVariable Long id) {
        return obraService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar obra")
    public ObraResponse atualizar(@PathVariable Long id, @Valid @RequestBody ObraRequest req) {
        return obraService.atualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remover obra")
    public void deletar(@PathVariable Long id) {
        obraService.deletar(id);
    }

    @GetMapping("/{id}/dashboard")
    @Operation(summary = "Dashboard financeiro da obra")
    public DashboardResponse dashboard(@PathVariable Long id) {
        return obraService.getDashboard(id);
    }

    @GetMapping("/{id}/orcamento")
    @Operation(summary = "Orçamento da obra, com gasto real por categoria")
    public OrcamentoResponse orcamento(@PathVariable Long id) {
        return orcamentoService.buscar(id);
    }

    @PutMapping("/{id}/orcamento")
    @Operation(summary = "Atualizar orçamento planejado da obra")
    public OrcamentoResponse atualizarOrcamento(@PathVariable Long id, @Valid @RequestBody OrcamentoRequest req) {
        return orcamentoService.atualizar(id, req);
    }
}
