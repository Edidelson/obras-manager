package com.obramanager.api.controller;

import com.obramanager.application.dto.request.CompraRequest;
import com.obramanager.application.dto.response.CompraResponse;
import com.obramanager.application.service.CompraService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/obras/{obraId}/compras")
@RequiredArgsConstructor
@Tag(name = "Compras")
@SecurityRequirement(name = "bearerAuth")
public class CompraController {

    private final CompraService compraService;

    @GetMapping
    @Operation(summary = "Listar compras de uma obra")
    public List<CompraResponse> listar(@PathVariable Long obraId) {
        return compraService.listar(obraId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar compra")
    public CompraResponse criar(@PathVariable Long obraId, @Valid @RequestBody CompraRequest req) {
        return compraService.criar(obraId, req);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalhe da compra")
    public CompraResponse buscar(@PathVariable Long obraId, @PathVariable Long id) {
        return compraService.buscar(obraId, id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remover compra")
    public void deletar(@PathVariable Long obraId, @PathVariable Long id) {
        compraService.deletar(obraId, id);
    }
}
