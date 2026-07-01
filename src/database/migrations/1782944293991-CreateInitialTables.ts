import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1782944293991 implements MigrationInterface {
    name = 'CreateInitialTables1782944293991'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "trainers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "email" character varying(180) NOT NULL, "cep" character varying(9) NOT NULL, "street" character varying(255), "district" character varying(100), "city" character varying(100), "state" character varying(50), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_f8ac7db7ae932e9e2bb7de0e466" UNIQUE ("email"), CONSTRAINT "PK_198da56395c269936d351ab774b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "trainer_id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "team_pokemons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "team_id" uuid NOT NULL, "pokemon_id" uuid NOT NULL, "position" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "uq_team_pokemon" UNIQUE ("team_id", "pokemon_id"), CONSTRAINT "PK_2bec44e343c84ec77289339765d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_team_pokemon_pokemon" ON "team_pokemons"  ("pokemon_id") `);
        await queryRunner.query(`CREATE INDEX "idx_team_pokemon_team" ON "team_pokemons"  ("team_id") `);
        await queryRunner.query(`CREATE TABLE "pokemons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "poke_api_id" integer NOT NULL, "name" character varying(100) NOT NULL, "sprite" character varying(500), "height" integer, "weight" integer, "types" text, "last_synced_at" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0927c32a460a1de08ec8cf028c9" UNIQUE ("poke_api_id"), CONSTRAINT "PK_a3172290413af616d9cfa1fdc9a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "teams" ADD CONSTRAINT "FK_2b528aae0bc3881d44c884a7618" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_pokemons" ADD CONSTRAINT "FK_1004631a47433b5d32b2c38faae" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_pokemons" ADD CONSTRAINT "FK_3be5d66b23dd0ac6ad2bcf11c82" FOREIGN KEY ("pokemon_id") REFERENCES "pokemons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team_pokemons" DROP CONSTRAINT "FK_3be5d66b23dd0ac6ad2bcf11c82"`);
        await queryRunner.query(`ALTER TABLE "team_pokemons" DROP CONSTRAINT "FK_1004631a47433b5d32b2c38faae"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_2b528aae0bc3881d44c884a7618"`);
        await queryRunner.query(`DROP TABLE "pokemons"`);
        await queryRunner.query(`DROP INDEX "public"."idx_team_pokemon_team"`);
        await queryRunner.query(`DROP INDEX "public"."idx_team_pokemon_pokemon"`);
        await queryRunner.query(`DROP TABLE "team_pokemons"`);
        await queryRunner.query(`DROP TABLE "teams"`);
        await queryRunner.query(`DROP TABLE "trainers"`);
    }

}
