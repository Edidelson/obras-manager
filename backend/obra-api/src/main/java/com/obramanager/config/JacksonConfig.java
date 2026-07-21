package com.obramanager.config;

import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Sem isso, o Jackson não sabe lidar com proxies/lazy-loading do Hibernate e
 * quebra ao serializar entidades JPA com relações @ManyToOne(LAZY) (ex.:
 * Fornecedor.usuario, Produto.usuario, Produto.categoria), gerando o erro
 * "No serializer found for class ...HibernateProxy...".
 *
 * FORCE_LAZY_LOADING fica desligado de propósito: várias entidades têm
 * relações bidirecionais (ex.: Produto.cotacoes <-> Cotacao.produto,
 * Obra.etapas <-> Etapa.obra), e forçar o carregamento de tudo na
 * serialização causaria recursão infinita / N+1 descontrolado. Relações
 * lazy ainda não inicializadas simplesmente saem como null no JSON; quando
 * o dado precisa aparecer (ex.: categoria do produto), a query do
 * repositório já busca isso com JOIN FETCH.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public Hibernate6Module hibernate6Module() {
        return new Hibernate6Module();
    }
}
