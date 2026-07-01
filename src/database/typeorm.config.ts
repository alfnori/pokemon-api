import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'node:path';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USER ?? 'pokemon',
  password: process.env.DATABASE_PASSWORD ?? 'pokemon',
  database: process.env.DATABASE_NAME ?? 'pokemon_api',
  entities: [resolve(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [resolve(__dirname, './migrations/*{.ts,.js}')],
  synchronize: false,
});
