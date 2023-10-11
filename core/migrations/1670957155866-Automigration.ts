import { MigrationInterface, QueryRunner } from "typeorm";

export class Automigration1670957155866 implements MigrationInterface {
    name = 'Automigration1670957155866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sprocket"."user_platform_account" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer NOT NULL, "platformId" integer NOT NULL, "platformAccountId" character varying NOT NULL, CONSTRAINT "UQ_c1e293939718af0341848e0828a" UNIQUE ("platformId", "platformAccountId"), CONSTRAINT "PK_bcd8ff22acd439360a79b6e0b3f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_platform_account" ADD CONSTRAINT "FK_122bbbcdec97c1b5e8dd1298376" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_platform_account" ADD CONSTRAINT "FK_edf33e55f97c0d3ac66406bce9f" FOREIGN KEY ("platformId") REFERENCES "platform"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`
            WITH accounts AS (SELECT DISTINCT mpa."createdAt", mpa."platformId", mpa."platformAccountId", m."userId"
                FROM sprocket.member_platform_account mpa INNER JOIN sprocket.member m ON m.id = mpa."memberId")
            INSERT INTO sprocket.user_platform_account ("createdAt", "platformId", "platformAccountId", "userId")
            SELECT "createdAt", "platformId", "platformAccountId", "userId" FROM accounts;
        `);
        await queryRunner.query(`DROP TABLE "sprocket"."member_platform_account"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."user_platform_account" DROP CONSTRAINT "FK_edf33e55f97c0d3ac66406bce9f"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_platform_account" DROP CONSTRAINT "FK_122bbbcdec97c1b5e8dd1298376"`);
        await queryRunner.query(`DROP TABLE "sprocket"."user_platform_account"`);
        await queryRunner.query(`CREATE TABLE "sprocket"."member_platform_account" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "memberId" integer NOT NULL, "platformId" integer NOT NULL, "platformAccountId" character varying NOT NULL, CONSTRAINT "UQ_c1e293939718af0341848e0828a" UNIQUE ("platformId", "platformAccountId"), CONSTRAINT "PK_bcd8ff22acd439360a79b6e0b3f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_platform_account" ADD CONSTRAINT "FK_122bbbcdec97c1b5e8dd1298376" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_platform_account" ADD CONSTRAINT "FK_edf33e55f97c0d3ac66406bce9f" FOREIGN KEY ("platformId") REFERENCES "platform"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
