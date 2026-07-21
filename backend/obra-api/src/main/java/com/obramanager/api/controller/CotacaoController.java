package com.obramanager.api.controller;

import com.obramanager.application.dto.request.CotacaoRequest;
import com.obramanager.application.dto.response.CotacaoResponse;
import com.obramanager.application.service.CotacaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/produtos/{produtoId}/cotacoes")
@RequiredArgsConstructor
@Tag(name = "Cotações")
@SecurityRequirement(name = "bearerAuth")
public class CotacaoController {

    private final CotacaoService cotacaoService;

    @GetMapping
    @Operation(summary = "Listar cotações por produto (ordenado por menor preço)")
    public List<CotacaoResponse> listar(@PathVariable Long produtoId) {
        return cotacaoService.listarPorProduto(produtoId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Adicionar cotação de preço")
    public CotacaoResponse adicionar(@PathVariable Long produtoId,
                                     @Valid @RequestBody CotacaoRequest req) {
        return cotacaoService.adicionar(produtoId, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remover cotação (soft delete)")
    public void deletar(@PathVariable Long produtoId, @PathVariable Long id) {
        cotacaoService.deletar(id);
    }
}
