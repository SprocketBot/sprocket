import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditTriggers1658698711311 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (queryRunner.isTransactionActive) {
            await queryRunner.commitTransaction()
            await queryRunner.startTransaction()
        }
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)
        await queryRunner.query(`SET search_path TO sprocket, public`);
        await queryRunner.query(`SELECT create_history_table('player'::text, true::boolean)`);
        await queryRunner.query(`SELECT create_history_table('user'::text, true::boolean)`);
        await queryRunner.query(`SELECT create_history_table('user_profile'::text, true::boolean)`);
        await queryRunner.query(`SELECT create_history_table('member'::text, true::boolean)`);
        await queryRunner.query(`SELECT create_history_table('member_profile'::text, true::boolean)`);
        await queryRunner.query(`SELECT create_history_table('franchise'::text, true::boolean)`);
        await queryRunner.query(`SELECT create_history_table('franchise_profile'::text, true::boolean)`);
        await queryRunner.query(`SELECT create_history_table('team'::text, true::boolean)`);
        await queryRunner.query(`SELECT create_history_table('roster_slot'::text, true::boolean)`);
        await queryRunner.query(`SELECT create_history_table('roster_role'::text, true::boolean)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`SET search_path TO sprocket, public`);

        await queryRunner.query(`SELECT remove_history_table('player')`);
        await queryRunner.query(`SELECT remove_history_table('user')`);
        await queryRunner.query(`SELECT remove_history_table('user_profile')`);
        await queryRunner.query(`SELECT remove_history_table('member')`);
        await queryRunner.query(`SELECT remove_history_table('member_profile')`);
        await queryRunner.query(`SELECT remove_history_table('franchise')`);
        await queryRunner.query(`SELECT remove_history_table('franchise_profile')`);
        await queryRunner.query(`SELECT remove_history_table('team')`);
        await queryRunner.query(`SELECT remove_history_table('roster_role')`);
        await queryRunner.query(`SELECT remove_history_table('roster_slot')`);
    }

}
