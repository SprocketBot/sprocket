import {MigrationInterface, QueryRunner} from "typeorm";

export class UserOrgTeamPermission1770500000000 implements MigrationInterface {
    name = "UserOrgTeamPermission1770500000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "CREATE TABLE \"sprocket\".\"user_org_team_permission\" (\"id\" SERIAL NOT NULL, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"userId\" integer NOT NULL, \"orgTeam\" smallint NOT NULL, CONSTRAINT \"PK_user_org_team_permission\" PRIMARY KEY (\"id\"))",
        );
        await queryRunner.query(
            "CREATE UNIQUE INDEX \"UQ_user_org_team_user_org_team\" ON \"sprocket\".\"user_org_team_permission\" (\"userId\", \"orgTeam\")",
        );
        await queryRunner.query(
            "CREATE INDEX \"user_org_team_permission_user_id_idx\" ON \"sprocket\".\"user_org_team_permission\" (\"userId\")",
        );
        await queryRunner.query(
            "ALTER TABLE \"sprocket\".\"user_org_team_permission\" ADD CONSTRAINT \"FK_user_org_team_permission_user\" FOREIGN KEY (\"userId\") REFERENCES \"sprocket\".\"user\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION",
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "ALTER TABLE \"sprocket\".\"user_org_team_permission\" DROP CONSTRAINT \"FK_user_org_team_permission_user\"",
        );
        await queryRunner.query(
            "DROP INDEX \"sprocket\".\"user_org_team_permission_user_id_idx\"",
        );
        await queryRunner.query(
            "DROP INDEX \"sprocket\".\"UQ_user_org_team_user_org_team\"",
        );
        await queryRunner.query("DROP TABLE \"sprocket\".\"user_org_team_permission\"");
    }
}
