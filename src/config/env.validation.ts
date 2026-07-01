import Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.string().default('pokemon'),
  DATABASE_PASSWORD: Joi.string().default('pokemon'),
  DATABASE_NAME: Joi.string().default('pokemon_api'),
  POKE_API_BASE_URL: Joi.string().uri().default('https://pokeapi.co/api/v2'),
  CEP_API_BASE_URL: Joi.string().uri().default('https://viacep.com.br/ws'),
  POKEMON_CACHE_TTL: Joi.number().default(604800),
  TEAM_MAX_SIZE: Joi.number().min(1).max(20).default(5),
});
