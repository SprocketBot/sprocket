import {MigrationInterface, QueryRunner} from "typeorm";

export class ReportCardAssets1770434634193 implements MigrationInterface {
    name = "ReportCardAssets1770434634193";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "CREATE TYPE \"sprocket\".\"report_card_asset_type_enum\" AS ENUM('SCRIM', 'MATCH')",
        );
        await queryRunner.query(
            "CREATE TABLE \"sprocket\".\"report_card_asset\" (\"id\" SERIAL NOT NULL, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"deletedAt\" TIMESTAMP, \"type\" \"sprocket\".\"report_card_asset_type_enum\" NOT NULL, \"sprocketId\" integer NOT NULL, \"legacyId\" integer NOT NULL, \"organizationId\" integer NOT NULL, \"minioKey\" character varying NOT NULL, \"scrimUuid\" uuid, \"userIds\" integer array NOT NULL DEFAULT '{}'::integer[], \"franchiseIds\" integer array NOT NULL DEFAULT '{}'::integer[], CONSTRAINT \"PK_3c6d0b7412b7edca6ad0e3ab4d6\" PRIMARY KEY (\"id\"))",
        );
        await queryRunner.query(
            "CREATE UNIQUE INDEX \"report_card_asset_type_sprocket_id_unique\" ON \"sprocket\".\"report_card_asset\" (\"type\", \"sprocketId\")",
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "DROP INDEX \"sprocket\".\"report_card_asset_type_sprocket_id_unique\"",
        );
        await queryRunner.query("DROP TABLE \"sprocket\".\"report_card_asset\"");
        await queryRunner.query(
            "DROP TYPE \"sprocket\".\"report_card_asset_type_enum\"",
        );
    }
}
