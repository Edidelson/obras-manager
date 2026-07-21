package com.obramanager.api.controller;

import com.obramanager.application.dto.request.FornecedorRequest;
import com.obramanager.application.dto.response.FornecedorExternoResponse;
import com.obramanager.application.service.FornecedorBuscaExternaService;
import com.obramanager.domain.entity.Fornecedor;
import com.obramanager.domain.entity.Usuario;
import com.obramanager.domain.repository.FornecedorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fornecedores")
@RequiredArgsConstructor
@Tag(name = "Fornecedores")
@SecurityRequirement(name = "bearerAuth")
public class FornecedorController {

    private final FornecedorRepository fornecedorRepository;
    private final FornecedorBuscaExternaService buscaExternaService;

    @GetMapping("/buscar-externos")
    @Operation(summary = "[TESTE] Busca lojas de material de construção reais via OpenStreetMap, pela cidade")
    public List<FornecedorExternoResponse> buscarExternos(@RequestParam String cidade) {
        return buscaExternaService.buscarPorCidade(cidade);
    }

    @GetMapping
    @Operation(summary = "Listar fornecedores (compartilhados entre todos os usuários, opcionalmente filtrados pela cidade da obra)")
    public List<Fornecedor> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) String cidade
    ) {
        boolean temBusca = busca != null && !busca.isBlank();
        boolean temCidade = cidade != null && !cidade.isBlank();

        if (temCidade && temBusca) return fornecedorRepository.buscarPorCidade(cidade, busca);
        if (temCidade) return fornecedorRepository.findByCidadeIgnoreCase(cidade);
        if (temBusca) return fornecedorRepository.buscar(busca);
        return fornecedorRepository.findByAtivoTrueOrderByNomeAsc();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar fornecedor")
    public Fornecedor criar(@Valid @RequestBody FornecedorRequest req) {
        var usuario = getUsuario();
        var fornecedor = Fornecedor.builder()
                .usuario(usuario)
                .nome(req.nome())
                .telefone(req.telefone())
                .whatsapp(req.whatsapp())
                .email(req.email())
                .cidade(req.cidade())
                .observacoes(req.observacoes())
                .build();
        return fornecedorRepository.save(fornecedor);
    }

    @GetMapping("/{id}")
    public Fornecedor buscar(@PathVariable Long id) {
        return fornecedorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fornecedor não encontrado."));
    }

    @PutMapping("/{id}")
    public Fornecedor atualizar(@PathVariable Long id, @Valid @RequestBody FornecedorRequest req) {
        var f = fornecedorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fornecedor não encontrado."));
        f.setNome(req.nome());
        f.setTelefone(req.telefone());
        f.setWhatsapp(req.whatsapp());
        f.setEmail(req.email());
        f.setCidade(req.cidade());
        f.setObservacoes(req.observacoes());
        return fornecedorRepository.save(f);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        fornecedorRepository.findById(id).ifPresent(f -> {
            f.setAtivo(false);
            fornecedorRepository.save(f);
        });
    }

    private Usuario getUsuario() {
        return (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
