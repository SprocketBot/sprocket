import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { FranchiseRepository } from '../src/db/franchise/franchise.repository';
import { ClubRepository } from '../src/db/club/club.repository';
import { TeamRepository } from '../src/db/team/team.repository';
import { GameRepository } from '../src/db/game/game.repository';
import { SkillGroupRepository } from '../src/db/skill_group/skill_group.repository';
import { FranchiseEntity } from '../src/db/franchise/franchise.entity';
import { ClubEntity } from '../src/db/club/club.entity';
import { TeamEntity } from '../src/db/team/team.entity';
import { GameEntity } from '../src/db/game/game.entity';
import { SkillGroupEntity } from '../src/db/skill_group/skill_group.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Client } from 'pg';
import { TypeormBootstrapService } from '../src/db/typeorm-bootstrap/typeorm-bootstrap.service';

describe('League Management (e2e)', () => {
  let app: INestApplication;
  let franchiseRepo: Repository<FranchiseEntity>;
  let clubRepo: Repository<ClubEntity>;
  let teamRepo: Repository<TeamEntity>;
  let gameRepo: Repository<GameEntity>;
  let skillGroupRepo: Repository<SkillGroupEntity>;

  beforeAll(async () => {
    // Create schema if not exists
    const client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'jacbaile',
      password: 'password',
      database: 'sprocket',
    });
    await client.connect();
    await client.query('CREATE SCHEMA IF NOT EXISTS sprocket');
    await client.end();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(TypeormBootstrapService)
    .useValue({
      createTypeOrmOptions: () => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'jacbaile',
        password: 'password',
        database: 'sprocket',
        synchronize: true, // Enable sync for tests
        autoLoadEntities: true,
        dropSchema: false, // Don't drop schema to preserve data if needed, or true to clean
      }),
    })
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    franchiseRepo = moduleFixture.get<Repository<FranchiseEntity>>(getRepositoryToken(FranchiseEntity));
    clubRepo = moduleFixture.get<Repository<ClubEntity>>(getRepositoryToken(ClubEntity));
    teamRepo = moduleFixture.get<Repository<TeamEntity>>(getRepositoryToken(TeamEntity));
    gameRepo = moduleFixture.get<Repository<GameEntity>>(getRepositoryToken(GameEntity));
    skillGroupRepo = moduleFixture.get<Repository<SkillGroupEntity>>(getRepositoryToken(SkillGroupEntity));
  });

  afterAll(async () => {
    await app.close();
  });

  it('should resolve full hierarchy: franchises -> clubs -> teams', async () => {
    // Seed Data
    const game = await gameRepo.save({
        name: 'Test Game',
    });
    const skillGroup = await skillGroupRepo.save({
        name: 'Test Skill Group',
        code: 'TSG',
        game: game,
    });
    const franchise = await franchiseRepo.save({
        name: 'Test Franchise',
        slug: 'test-franchise',
        isActive: true,
    });
    const club = await clubRepo.save({
        name: 'Test Club',
        slug: 'test-club',
        franchise: franchise,
        game: game,
        isActive: true,
    });
    const team = await teamRepo.save({
        name: 'Test Team',
        slug: 'test-team',
        club: club,
        skillGroup: skillGroup,
        rosterSizeLimit: 5,
        isActive: true,
    });

    // Query via GraphQL
    const query = `
      query {
        franchises {
          id
          name
          slug
          clubs {
            id
            name
            slug
            teams {
              id
              name
              slug
              skillGroup {
                name
              }
            }
          }
        }
      }
    `;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.franchises).toBeDefined();
        const foundFranchise = res.body.data.franchises.find(f => f.id === franchise.id.toString()); // IDs might be strings in GQL
        expect(foundFranchise).toBeDefined();
        expect(foundFranchise.name).toBe('Test Franchise');
        expect(foundFranchise.clubs).toHaveLength(1);
        expect(foundFranchise.clubs[0].name).toBe('Test Club');
        expect(foundFranchise.clubs[0].teams).toHaveLength(1);
        expect(foundFranchise.clubs[0].teams[0].name).toBe('Test Team');
        expect(foundFranchise.clubs[0].teams[0].skillGroup.name).toBe('Test Skill Group');
      });
  });
});
