package com.obramanager.api.controller;

import com.obramanager.application.dto.request.ProdutoRequest;
import com.obramanager.domain.entity.Categoria;
import com.obramanager.domain.entity.Produto;
import com.obramanager.domain.entity.Usuario;
import com.obramanager.domain.repository.CategoriaRepository;
import com.obramanager.domain.repository.ProdutoRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/produtos")
@RequiredArgsConstructor
@Tag(name = "Produtos")
@SecurityRequirement(name = "bearerAuth")
public class ProdutoController {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;

    @GetMapping
    @Operation(summary = "Listar produtos (compartilhados entre todos os usuários)")
    public List<Produto> listar(@RequestParam(required = false) String busca) {
        if (busca != null && !busca.isBlank()) {
            return produtoRepository.buscar(busca);
        }
        return produtoRepository.findByAtivoTrueOrderByNomeAsc();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar produto")
    public Produto criar(@Valid @RequestBody ProdutoRequest req) {
        var usuario = getUsuario();
        Categoria categoria = null;
        if (req.categoriaId() != null) {
            categoria = categoriaRepository.findById(req.categoriaId())
                    .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada."));
        }
        var produto = Produto.builder()
                .usuario(usuario)
                .categoria(categoria)
                .nome(req.nome())
                .unidade(req.unidade())
                .quantidadePlanejada(req.quantidadePlanejada() != null ? req.quantidadePlanejada() : BigDecimal.ZERO)
                .build();
        return produtoRepository.save(produto);
    }

    @GetMapping("/{id}")
    public Produto buscar(@PathVariable Long id) {
        return produtoRepository.buscarComCategoria(id)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado."));
    }

    @PutMapping("/{id}")
    public Produto atualizar(@PathVariable Long id, @Valid @RequestBody ProdutoRequest req) {
        var p = produtoRepository.buscarComCategoria(id)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado."));
        if (req.categoriaId() != null) {
            var categoria = categoriaRepository.findById(req.categoriaId())
                    .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada."));
            p.setCategoria(categoria);
        }
        p.setNome(req.nome());
        p.setUnidade(req.unidade());
        if (req.quantidadePlanejada() != null) p.setQuantidadePlanejada(req.quantidadePlanejada());
        return produtoRepository.save(p);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        produtoRepository.findById(id).ifPresent(p -> {
            p.setAtivo(false);
            produtoRepository.save(p);
        });
    }

    private Usuario getUsuario() {
        return (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
