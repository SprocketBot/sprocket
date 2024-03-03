import { MigrationInterface, QueryRunner } from "typeorm"

export class AddStatFieldsMledb1659572530450 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE mledb.player_stats_core ADD COLUMN gpi numeric;`);
        await queryRunner.query(`ALTER TABLE mledb.player_stats_core ADD COLUMN opi numeric`);
        await queryRunner.query(`ALTER TABLE mledb.player_stats_core ADD COLUMN dpi numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE mledb.player_stats_core DROP COLUMN gpi;`);
        await queryRunner.query(`ALTER TABLE mledb.player_stats_core DROP COLUMN opi;`);
        await queryRunner.query(`ALTER TABLE mledb.player_stats_core DROP COLUMN dpi;`);
    }

}
