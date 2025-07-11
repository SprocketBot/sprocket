import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create scrims table
    await queryRunner.createTable(
      new Table({
        name: 'scrim',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            isGenerated: false,
          },
          {
            name: 'authorId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'maxParticipants',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'gameId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'gameModeId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'skillGroupId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'state',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'pendingTtl',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'removedParticipants',
            type: 'jsonb',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create scrim_participants table
    await queryRunner.createTable(
      new Table({
        name: 'scrim_participant',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'scrimId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'checkedIn',
            type: 'boolean',
            default: false,
          },
        ],
      }),
      true,
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'scrim_participant',
      new TableForeignKey({
        columnNames: ['scrimId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'scrim',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('scrim_participant');
    await queryRunner.dropTable('scrim');
  }
}
