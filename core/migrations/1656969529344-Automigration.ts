import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1656969529344 implements MigrationInterface {
    name = 'Automigration1656969529344'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" ADD "photoId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" ADD CONSTRAINT "UQ_3ae22b968bc60673e610c78dd39" UNIQUE ("photoId")`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" ADD CONSTRAINT "FK_3ae22b968bc60673e610c78dd39" FOREIGN KEY ("photoId") REFERENCES "sprocket"."photo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" DROP CONSTRAINT "FK_3ae22b968bc60673e610c78dd39"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" DROP CONSTRAINT "UQ_3ae22b968bc60673e610c78dd39"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."franchise_profile" DROP COLUMN "photoId"`);
    }
}
