package com.obramanager.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.obramanager.application.dto.response.FornecedorExternoResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * TESTE — busca lojas de material de construção reais na cidade informada,
 * usando o OpenStreetMap (Overpass API), que é gratuito e não exige chave de
 * API. Só encontra estabelecimentos que já estão mapeados no OSM pra aquela
 * cidade — cobertura varia bastante dependendo de quanto a região foi mapeada
 * pela comunidade. Não busca preços (não existe fonte pública confiável pra
 * isso); só sugere candidatos a fornecedor pra você adicionar manualmente.
 */
@Service
@Slf4j
public class FornecedorBuscaExternaService {

    private static final String OVERPASS_URL = "https://overpass-api.de/api/interpreter";
    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

    // Tags do OSM que cobrem loja de material de construção — no Brasil o
    // mapeamento é inconsistente: às vezes é shop=doityourself, às vezes
    // shop=hardware, às vezes só trade=building_materials junto de outro
    // shop genérico. Por isso o filtro cobre tudo isso e mais alguns
    // correlatos (tinta, vidraçaria, madeireira, jardinagem).
    private static final String FILTRO_TAGS = """
            node["shop"~"hardware|doityourself|trade|houseware|electrical|paint|glaziery|garden_centre|tiles|bathroom_furnishing|houseware"](area.a);
            way["shop"~"hardware|doityourself|trade|houseware|electrical|paint|glaziery|garden_centre|tiles|bathroom_furnishing|houseware"](area.a);
            node["trade"="building_materials"](area.a);
            way["trade"="building_materials"](area.a);
            """;

    private static final String FILTRO_TAGS_RAIO = """
            node["shop"~"hardware|doityourself|trade|houseware|electrical|paint|glaziery|garden_centre|tiles|bathroom_furnishing|houseware"](around:%d,%s,%s);
            way["shop"~"hardware|doityourself|trade|houseware|electrical|paint|glaziery|garden_centre|tiles|bathroom_furnishing|houseware"](around:%d,%s,%s);
            node["trade"="building_materials"](around:%d,%s,%s);
            way["trade"="building_materials"](around:%d,%s,%s);
            """;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper mapper = new ObjectMapper();

    public List<FornecedorExternoResponse> buscarPorCidade(String cidade) {
        var porArea = buscarPorArea(cidade);
        if (!porArea.isEmpty()) return porArea;

        // Cidade pequena ou pouco mapeada: a área existe mas não tem nenhuma
        // loja com essas tags dentro dela (ou a área nem foi encontrada).
        // Cai pra busca por raio a partir do centro geográfico da cidade.
        log.info("Busca por área não encontrou nada pra '{}', tentando por raio (geocodificação)", cidade);
        var coordenadas = geocodificar(cidade);
        if (coordenadas == null) return List.of();
        return buscarPorRaio(coordenadas[0], coordenadas[1], 15000);
    }

    private List<FornecedorExternoResponse> buscarPorArea(String cidade) {
        String cidadeEscapada = cidade.replace("\"", "\\\"");
        String query = """
                [out:json][timeout:25];
                area["name"="%s"]["boundary"="administrative"]->.a;
                (
                %s
                );
                out center 30;
                """.formatted(cidadeEscapada, FILTRO_TAGS);
        return executarOverpass(query, cidade);
    }

    private List<FornecedorExternoResponse> buscarPorRaio(double lat, double lon, int raioMetros) {
        String latStr = String.valueOf(lat);
        String lonStr = String.valueOf(lon);
        String query = """
                [out:json][timeout:25];
                (
                %s
                );
                out center 30;
                """.formatted(FILTRO_TAGS_RAIO.formatted(
                raioMetros, latStr, lonStr, raioMetros, latStr, lonStr,
                raioMetros, latStr, lonStr, raioMetros, latStr, lonStr));
        return executarOverpass(query, "raio " + raioMetros + "m em " + lat + "," + lon);
    }

    // Geocodifica o nome da cidade pra um par lat/lon, usando o Nominatim
    // (mesmo projeto OSM, também gratuito). Necessário pro fallback por raio.
    private double[] geocodificar(String cidade) {
        try {
            String url = NOMINATIM_URL + "?city=" + URLEncoder.encode(cidade, StandardCharsets.UTF_8)
                    + "&country=Brazil&format=json&limit=1";
            var request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "ObraManager/1.0 (teste de busca de fornecedores)")
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build();
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.warn("Nominatim retornou status {} pra cidade '{}'", response.statusCode(), cidade);
                return null;
            }
            JsonNode arr = mapper.readTree(response.body());
            if (!arr.isArray() || arr.isEmpty()) {
                log.warn("Nominatim não encontrou coordenadas pra cidade '{}'", cidade);
                return null;
            }
            JsonNode primeiro = arr.get(0);
            return new double[]{primeiro.get("lat").asDouble(), primeiro.get("lon").asDouble()};
        } catch (Exception e) {
            log.error("Erro ao geocodificar cidade '{}'", cidade, e);
            return null;
        }
    }

    private List<FornecedorExternoResponse> executarOverpass(String query, String contexto) {
        try {
            var body = "data=" + URLEncoder.encode(query, StandardCharsets.UTF_8);
            var request = HttpRequest.newBuilder()
                    .uri(URI.create(OVERPASS_URL))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .timeout(Duration.ofSeconds(25))
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.warn("Overpass API retornou status {} ({})", response.statusCode(), contexto);
                return List.of();
            }
            return parsear(response.body());
        } catch (Exception e) {
            log.error("Erro ao buscar fornecedores externos (OSM) — {}", contexto, e);
            return List.of();
        }
    }

    private List<FornecedorExternoResponse> parsear(String json) throws Exception {
        List<FornecedorExternoResponse> resultado = new ArrayList<>();
        JsonNode root = mapper.readTree(json);
        JsonNode elements = root.path("elements");

        for (JsonNode el : elements) {
            JsonNode tags = el.path("tags");
            String nome = tags.path("name").asText(null);
            if (nome == null || nome.isBlank()) continue;

            String rua = tags.path("addr:street").asText(null);
            String numero = tags.path("addr:housenumber").asText(null);
            String bairro = tags.path("addr:suburb").asText(null);
            StringBuilder endereco = new StringBuilder();
            if (rua != null) {
                endereco.append(rua);
                if (numero != null) endereco.append(", ").append(numero);
            }
            if (bairro != null) {
                if (!endereco.isEmpty()) endereco.append(" — ");
                endereco.append(bairro);
            }

            String telefone = tags.path("phone").asText(null);
            if (telefone == null) telefone = tags.path("contact:phone").asText(null);

            Double lat = el.has("lat") ? el.get("lat").asDouble()
                    : el.path("center").has("lat") ? el.path("center").get("lat").asDouble() : null;
            Double lon = el.has("lon") ? el.get("lon").asDouble()
                    : el.path("center").has("lon") ? el.path("center").get("lon").asDouble() : null;

            resultado.add(new FornecedorExternoResponse(
                    nome,
                    endereco.isEmpty() ? null : endereco.toString(),
                    telefone,
                    lat,
                    lon
            ));
        }
        return resultado;
    }
}
