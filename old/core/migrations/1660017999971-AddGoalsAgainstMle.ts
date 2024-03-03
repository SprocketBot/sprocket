import { MigrationInterface, QueryRunner } from "typeorm"

export class AddGoalsAgainstMle1660017999971 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE mledb.player_stats_core ADD COLUMN goals_against numeric;`);
        await queryRunner.query(`ALTER TABLE mledb.player_stats_core ADD COLUMN shots_against numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE mledb.player_stats_core DROP COLUMN goals_against;`);
        await queryRunner.query(`ALTER TABLE mledb.player_stats_core DROP COLUMN shots_against`);
    }

}
