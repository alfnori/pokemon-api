Bem-vindo(a) ao desafio técnico para a vaga de Desenvolvedor Backend Sênior na Leany!

O objetivo deste case é avaliar:

    Sua capacidade de modelar um domínio e o banco de dados
    Qualidade da arquitetura e da organização do código
    Implementação de regras de negócio reais (não apenas CRUD)
    Uso adequado de NestJS + TypeORM,
    Integração com serviços externos e estratégia de persistência/cache
    Clareza nas decisões técnicas (explicadas no código e no README)

Tecnologias obrigatórias:

    NestJS
    TypeORM (apenas TypeORM – não utilizar outros ORMs)
    Banco relacional: PostgreSQL ou MySQL
    Banco rodando via Docker (docker-compose)

Contexto geral:

Crie uma API REST para gerenciar:

    Treinadores
    Times desses treinadores
    Pokémon, consumindo dados da PokéAPI e persistindo-os localmente no banco

Regras importantes:

Os dados de Pokémon (por exemplo: nome, tipos, sprite, id externo) devem ser:

    buscados na PokéAPI
    salvos no banco de dados
    reutilizados a partir do banco sempre que fizer sentido (não depender apenas de chamadas em tempo real)

Você deve implementar uma estratégia de como e quando sincronizar/atualizar esses dados (TTL, ação manual, endpoint de atualização, etc.) e explicá-la no README.
Regras de negócio mínimas:

Você deve modelar pelo menos as seguintes ideias (como entidades, relacionamentos e regras):
Treinador:

    Um Treinador deve poder ter um ou mais Times.
    Não deve ser possível excluir um Treinador que possua Times ativos sem aplicar uma regra clara:
    por exemplo: bloquear a exclusão, remover em cascata, usar soft delete, etc.
    A regra escolhida deve estar implementada e descrita no README.

Time:

    Um Time deve estar vinculado a um único Treinador.
    Um Time deve ser composto por vários Pokémon associados por meio de uma estrutura/entidade de associação (por exemplo, TeamPokemon ou outro nome que faça sentido no seu modelo).

Pokémon:

    Pokémon deve ser uma entidade persistida no banco, com referência ao identificador da PokéAPI.
    Ao associar um Pokémon a um Time:
        se ele ainda não existir no banco local, deve ser buscado na PokéAPI e salvo antes da associação;
        em chamadas futuras, a aplicação deve priorizar o dado local, consultando a PokéAPI apenas quando fizer sentido de acordo com a sua estratégia.

Regras do Time x Pokémon:

    Um Time pode ter no máximo 5 Pokémon.
    Tentativas de adicionar um 6º Pokémon devem ser rejeitadas com um erro adequado.
    Não deve ser possível adicionar o mesmo Pokémon duas vezes no mesmo Time.
    Definir claramente o que acontece com as associações entre Times e Pokémon quando:
        um Time é removido
        um Treinador é removido

Você é livre para definir endpoints, payloads e respostas que façam sentido para esse domínio, desde que essas regras estejam cobertas.
Integrações externas

Você deve implementar pelo menos duas integrações externas:
1. PokéAPI

    Usada para buscar dados de Pokémon e alimentar a sua entidade local de Pokémon.
    Como você trata:
        quando busca,
        quando grava,
        quando reutiliza dados salvos,

deve estar explicado no README.
2. Serviço de CEP (ex.: ViaCEP ou similar)

Objetivo: enriquecer os dados de Treinador com endereço completo.

    Crie um fluxo onde seja possível informar um CEP para um Treinador e obter:
        CEP,
        logradouro,
        bairro,
        cidade,
        estado (de acordo com o serviço externo escolhido).
        Esses dados devem ser consumidos de um serviço externo de CEP e disponibilizados como um serviço interno da API (por exemplo, um CepService).

    Você decide:
        se o endereço será persistido junto ao Treinador,
        se será apenas consultado “on demand”,
        se haverá endpoint específico para atualizar/consultar o endereço.
        A forma como essa integração se encaixa no domínio deve estar clara no código e descrita no README.
