import { MigrationInterface, QueryRunner } from "typeorm";
export class untitledMigration1725073846010 implements MigrationInterface {
  name = 'untitledMigration1725073846010'

  public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_group" ADD "start" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_group" ADD "end" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_group" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_group" ADD "parentId" uuid`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_group" ADD "typeId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_group_type" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_group" ADD CONSTRAINT "FK_3cef37b464461a9c3729d520cda" FOREIGN KEY ("parentId") REFERENCES "sprocket"."schedule_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_group" ADD CONSTRAINT "FK_6b2836d4ed4dff841b40d9bc1ee" FOREIGN KEY ("typeId") REFERENCES "sprocket"."schedule_group_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        
        await queryRunner.query(`ALTER TABLE "history"."schedule_group_history" ADD "start" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "history"."schedule_group_history" ADD "end" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "history"."schedule_group_history" ADD "name" character varying`);
        await queryRunner.query(`ALTER TABLE "history"."schedule_group_history" ADD "parentId" uuid`);
        await queryRunner.query(`ALTER TABLE "history"."schedule_group_history" ADD "typeId" uuid`);
        await queryRunner.query(`ALTER TABLE "history"."schedule_group_type_history" ADD "name" character varying`);
  }
  public async down (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_group" DROP COLUMN "start"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_group" DROP COLUMN "end"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_group" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_group" DROP COLUMN "parentId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_group" DROP COLUMN "typeId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_group_type" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_group" DROP CONSTRAINT "FK_3cef37b464461a9c3729d520cda"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."schedule_group" DROP CONSTRAINT "FK_6b2836d4ed4dff841b40d9bc1ee"`);

        await queryRunner.query(`ALTER TABLE "history"."schedule_group_history" DROP "start"`);
        await queryRunner.query(`ALTER TABLE "history"."schedule_group_history" DROP "end"`);
        await queryRunner.query(`ALTER TABLE "history"."schedule_group_history" DROP "name"`);
        await queryRunner.query(`ALTER TABLE "history"."schedule_group_history" DROP "parentId"`);
        await queryRunner.query(`ALTER TABLE "history"."schedule_group_history" DROP "typeId"`);
        await queryRunner.query(`ALTER TABLE "history"."schedule_group_type_history" DROP "name"`);
  }
}
