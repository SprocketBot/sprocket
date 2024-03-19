import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHistoryTables1710860261269 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`SELECT create_history_table('user', true)`)
        await queryRunner.query(`SELECT create_history_table('user_auth_account', true)`)
        await queryRunner.query(`SELECT create_history_table('franchise', true)`)
        await queryRunner.query(`SELECT create_history_table('team', true)`)
        await queryRunner.query(`SELECT create_history_table('fixture', true)`)
        await queryRunner.query(`SELECT create_history_table('scrim', true)`)
        await queryRunner.query(`SELECT create_history_table('game', true)`)
        await queryRunner.query(`SELECT create_history_table('team_stat', true)`)
        await queryRunner.query(`SELECT create_history_table('player_stat', true)`)
        await queryRunner.query(`SELECT create_history_table('player', true)`)
        await queryRunner.query(`SELECT create_history_table('game_mode', true)`)
        await queryRunner.query(`SELECT create_history_table('schedule_group', true)`)
        await queryRunner.query(`SELECT create_history_table('skill_group', true)`)
        await queryRunner.query(`SELECT create_history_table('round', true)`)
        await queryRunner.query(`SELECT create_history_table('schedule_group_type', true)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
