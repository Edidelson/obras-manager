package com.obramanager.infrastructure.loader;

import com.obramanager.domain.entity.Produto;
import com.obramanager.domain.repository.ProdutoRepository;
import com.obramanager.infrastructure.external.UnsplashService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!test") // Não executa em testes
public class ProdutoImagemLoader implements CommandLineRunner {

    private final ProdutoRepository produtoRepository;
    private final UnsplashService unsplashService;

    @Override
    public void run(String... args) throws Exception {
        log.info("🖼️ Iniciando carregamento de imagens dos produtos...");

        // Buscar todos os produtos sem imagem
        List<Produto> produtosSemImagem = produtoRepository.findByImagemUrlIsNull();

        if (produtosSemImagem.isEmpty()) {
            log.info("✅ Todos os produtos já possuem imagens!");
            return;
        }

        log.info("📷 Encontrados {} produtos sem imagem. Buscando no Unsplash...", produtosSemImagem.size());

        int sucessos = 0;
        int falhas = 0;

        for (Produto produto : produtosSemImagem) {
            try {
                var imagemUrl = unsplashService.buscarImagemPorCategoria(
                        produto.getCategoria() != null ? produto.getCategoria().getId().intValue() : 1,
                        produto.getNome()
                );

                if (imagemUrl.isPresent()) {
                    produto.setImagemUrl(imagemUrl.get());
                    produtoRepository.save(produto);
                    sucessos++;
                    log.debug("✅ Imagem adicionada: {}", produto.getNome());
                } else {
                    falhas++;
                    log.warn("⚠️ Sem imagem encontrada para: {}", produto.getNome());
                }

                // Rate limit: esperar um pouco entre requisições pra não sobrecarregar a API
                Thread.sleep(100);

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("❌ Interrompido ao processar imagem de: {}", produto.getNome());
                break;
            } catch (Exception e) {
                falhas++;
                log.error("❌ Erro ao buscar imagem para '{}': {}", produto.getNome(), e.getMessage());
            }
        }

        log.info("🎉 Carregamento de imagens concluído!");
        log.info("   ✅ Sucessos: {} | ⚠️ Falhas: {}", sucessos, falhas);
    }
}
