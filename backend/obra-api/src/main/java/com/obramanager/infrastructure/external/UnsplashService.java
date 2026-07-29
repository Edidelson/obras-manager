package com.obramanager.infrastructure.external;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UnsplashService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${unsplash.api-key}")
    private String apiKey;

    private static final String UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";

    /**
     * Busca uma imagem do Unsplash baseado no termo de busca
     * @param searchTerm termo para buscar (ex: "cimento", "pedreiro")
     * @return URL da imagem, se encontrar
     */
    public Optional<String> buscarImagem(String searchTerm) {
        try {
            String url = String.format("%s?query=%s&client_id=%s&per_page=1&orientation=landscape",
                    UNSPLASH_API_URL, encodeSearchTerm(searchTerm), apiKey);

            log.debug("Buscando imagem no Unsplash: {}", searchTerm);

            String response = restTemplate.getForObject(url, String.class);

            if (response == null) {
                log.warn("Resposta vazia do Unsplash para: {}", searchTerm);
                return Optional.empty();
            }

            JsonNode root = objectMapper.readTree(response);
            JsonNode results = root.get("results");

            if (results != null && results.isArray() && results.size() > 0) {
                String imageUrl = results.get(0)
                        .get("urls")
                        .get("regular")
                        .asText();

                log.info("Imagem encontrada para '{}': {}", searchTerm, imageUrl);
                return Optional.of(imageUrl);
            }

            log.warn("Nenhuma imagem encontrada para: {}", searchTerm);
            return Optional.empty();

        } catch (Exception e) {
            log.error("Erro ao buscar imagem no Unsplash para '{}': {}", searchTerm, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Busca imagens para diferentes termos de construção
     */
    public Optional<String> buscarImagemPorCategoria(int categoriaId, String produtoNome) {
        // Mapear categoria para termo de busca mais genérico
        String searchTerm = switch (categoriaId) {
            case 1 -> "construction materials cement"; // Materiais
            case 2 -> "construction workers"; // Mão de obra
            case 3 -> "electrical installation"; // Elétrica
            case 4 -> "plumbing pipes"; // Hidráulica
            case 5 -> "home finishing"; // Acabamento
            case 6 -> "roof tiles"; // Cobertura
            case 7 -> "foundation concrete"; // Fundação
            case 8 -> "construction tools"; // Ferramentas
            default -> produtoNome.split(" ")[0]; // Usa primeira palavra do nome
        };

        return buscarImagem(searchTerm);
    }

    private String encodeSearchTerm(String term) {
        return term.replace(" ", "%20");
    }
}
