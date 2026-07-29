package com.obramanager.api.controller;

import com.obramanager.domain.entity.Categoria;
import com.obramanager.domain.repository.CategoriaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categorias")
@RequiredArgsConstructor
@Tag(name = "Categorias")
@SecurityRequirement(name = "bearerAuth")
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;

    @GetMapping
    @Operation(summary = "Listar todas as categorias de produtos")
    public List<Categoria> listar() {
        return categoriaRepository.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar categoria por ID")
    public Categoria buscar(@PathVariable Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada."));
    }
}
