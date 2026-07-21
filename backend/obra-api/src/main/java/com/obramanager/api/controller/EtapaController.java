package com.obramanager.api.controller;

import com.obramanager.application.dto.request.EtapaRequest;
import com.obramanager.application.dto.response.EtapaResponse;
import com.obramanager.application.service.EtapaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/obras/{obraId}/etapas")
@RequiredArgsConstructor
@Tag(name = "Etapas")
@SecurityRequirement(name = "bearerAuth")
public class EtapaController {

    private final EtapaService etapaService;

    @GetMapping
    @Operation(summary = "Listar etapas de uma obra")
    public List<EtapaResponse> listar(@PathVariable Long obraId) {
        return etapaService.listar(obraId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cadastrar etapa")
    public EtapaResponse criar(@PathVariable Long obraId, @Valid @RequestBody EtapaRequest req) {
        return etapaService.criar(obraId, req);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar etapa")
    public EtapaResponse atualizar(@PathVariable Long obraId, @PathVariable Long id,
                                    @Valid @RequestBody EtapaRequest req) {
        return etapaService.atualizar(obraId, id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remover etapa")
    public void deletar(@PathVariable Long obraId, @PathVariable Long id) {
        etapaService.deletar(obraId, id);
    }
}
