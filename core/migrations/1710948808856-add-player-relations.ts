import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlayerRelations1710948808856 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."player" ADD "userId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" ADD "gameId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" ADD "skillGroupId" uuid NOT NULL`);

        await queryRunner.query(`ALTER TABLE "sprocket"."player" ADD CONSTRAINT "FK_7687919bf054bf262c669d3ae21" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" ADD CONSTRAINT "FK_7dfdd31fcd2b5aa3b08ed15fe8a" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" ADD CONSTRAINT "FK_622bd2e2975785c536a74754290" FOREIGN KEY ("skillGroupId") REFERENCES "skill_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        
        // Keep History Table in Sync
        await queryRunner.query(`ALTER TABLE "history"."player_history" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "history"."player_history" ADD "gameId" uuid`);
        await queryRunner.query(`ALTER TABLE "history"."player_history" ADD "skillGroupId" uuid`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."player" DROP CONSTRAINT "FK_622bd2e2975785c536a74754290"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" DROP CONSTRAINT "FK_7dfdd31fcd2b5aa3b08ed15fe8a"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" DROP CONSTRAINT "FK_7687919bf054bf262c669d3ae21"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" DROP COLUMN "skillGroupId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" DROP COLUMN "gameId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."player" DROP COLUMN "userId"`);
    }

}
