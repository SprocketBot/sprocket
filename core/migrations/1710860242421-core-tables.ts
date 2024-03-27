import { MigrationInterface, QueryRunner } from "typeorm";

export class CoreTables1710860242421 implements MigrationInterface {
    name = 'CoreTables1710860242421'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sprocket"."franchise" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0d92e63ee108403e7f251ef8e35" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sprocket"."game_mode" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ef9a2ad96f7bcea1655cd17e575" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sprocket"."round" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_34bd959f3f4a90eb86e4ae24d2d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sprocket"."skill_group" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7aba2020a477493c6620acebb30" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "sprocket"."user_auth_account_platform_enum" AS ENUM('DISCORD')`);
        await queryRunner.query(`CREATE TABLE "sprocket"."user_auth_account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "platform" "sprocket"."user_auth_account_platform_enum" NOT NULL, "platformId" character varying NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_1162672db36e898248f0bd8da17" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sprocket"."user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "username" character varying NOT NULL, "avatarUrl" character varying NOT NULL, "active" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sprocket"."game" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sprocket"."player_stat" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ed3543c123f2d2c52da0555599a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sprocket"."schedule_group_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_33f1d34f327abe56f6b1a3f716a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sprocket"."schedule_group" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b9579e4a3a46e2afdae0b757048" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sprocket"."team" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sprocket"."match" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "CHK_058353ede22f66d85a01184659" CHECK (false) no inherit, CONSTRAINT "PK_92b6c3a6631dd5b24a67c69f69d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sprocket"."fixture" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d9634ba06480dc240af97ad548c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sprocket"."scrim" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ddbb27697697aebc46418c38631" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sprocket"."team_stat" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_02ca423da304123f0bbe8e63d88" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sprocket"."player" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_auth_account" ADD CONSTRAINT "FK_6ce330885ba5e40b2a02407d4e7" FOREIGN KEY ("userId") REFERENCES "sprocket"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."user_auth_account" DROP CONSTRAINT "FK_6ce330885ba5e40b2a02407d4e7"`);
        await queryRunner.query(`DROP TABLE "sprocket"."player"`);
        await queryRunner.query(`DROP TABLE "sprocket"."team_stat"`);
        await queryRunner.query(`DROP TABLE "sprocket"."scrim"`);
        await queryRunner.query(`DROP TABLE "sprocket"."fixture"`);
        await queryRunner.query(`DROP TABLE "sprocket"."match"`);
        await queryRunner.query(`DROP TABLE "sprocket"."team"`);
        await queryRunner.query(`DROP TABLE "sprocket"."schedule_group"`);
        await queryRunner.query(`DROP TABLE "sprocket"."schedule_group_type"`);
        await queryRunner.query(`DROP TABLE "sprocket"."player_stat"`);
        await queryRunner.query(`DROP TABLE "sprocket"."game"`);
        await queryRunner.query(`DROP TABLE "sprocket"."user"`);
        await queryRunner.query(`DROP TABLE "sprocket"."user_auth_account"`);
        await queryRunner.query(`DROP TYPE "sprocket"."user_auth_account_platform_enum"`);
        await queryRunner.query(`DROP TABLE "sprocket"."skill_group"`);
        await queryRunner.query(`DROP TABLE "sprocket"."round"`);
        await queryRunner.query(`DROP TABLE "sprocket"."game_mode"`);
        await queryRunner.query(`DROP TABLE "sprocket"."franchise"`);
    }

}
