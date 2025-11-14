import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateScrimTimeoutTable1762982610933 implements MigrationInterface {
    name = 'CreateScrimTimeoutTable1762982610933'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create scrim_timeout table
        await queryRunner.query(`CREATE TABLE "sprocket"."scrim_timeout" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updateAt" TIMESTAMP NOT NULL DEFAULT now(),
            "expiresAt" TIMESTAMP NOT NULL,
            "reason" character varying NOT NULL,
            "playerId" uuid NOT NULL,
            CONSTRAINT "PK_a1b2c3d4e5f6g7h8i9j0k1l2m3" PRIMARY KEY ("id")
        )`);

        // Add foreign key constraint
        await queryRunner.query(`ALTER TABLE "sprocket"."scrim_timeout" ADD CONSTRAINT "FK_2b3b4b5b6b7b8b9b0c1d2e3f4g5" FOREIGN KEY ("playerId") REFERENCES "sprocket"."player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Add indexes for performance
        await queryRunner.query(`CREATE INDEX "IDX_7g8h9i0j1k2l3m4n5o6p7q8r9" ON "sprocket"."scrim_timeout" ("playerId")`);
        await queryRunner.query(`CREATE INDEX "IDX_8h9i0j1k2l3m4n5o6p7q8r9s0" ON "sprocket"."scrim_timeout" ("expiresAt")`);

        // Add history tracking
        await queryRunner.query(`SELECT create_history_table('scrim_timeout', true)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove history tracking
        await queryRunner.query(`SELECT remove_history_table('scrim_timeout')`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_7g8h9i0j1k2l3m4n5o6p7q8r9"`);
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_8h9i0j1k2l3m4n5o6p7q8r9s0"`);

        // Drop foreign key constraint
        await queryRunner.query(`ALTER TABLE "sprocket"."scrim_timeout" DROP CONSTRAINT "FK_2b3b4b5b6b7b8b9b0c1d2e3f4g5"`);

        // Drop table
        await queryRunner.query(`DROP TABLE "sprocket"."scrim_timeout"`);
    }

}
