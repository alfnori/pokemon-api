export const configuration = () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    user: process.env.DATABASE_USER ?? 'pokemon',
    password: process.env.DATABASE_PASSWORD ?? 'pokemon',
    name: process.env.DATABASE_NAME ?? 'pokemon_api',
  },
  pokeApi: {
    baseUrl: process.env.POKE_API_BASE_URL ?? 'https://pokeapi.co/api/v2',
  },
  cepApi: {
    baseUrl: process.env.CEP_API_BASE_URL ?? 'https://viacep.com.br/ws',
  },
  pokemon: {
    cacheTtl: parseInt(process.env.POKEMON_CACHE_TTL ?? '604800', 10),
  },
});
