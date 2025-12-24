import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as internal from '../../src/db/internal';
import {
    GameEntity,
    GameModeEntity,
    MatchEntity,
    RoundEntity,
    PlayerStatEntity,
    ScrimEntity,
    MatchStatus,
    FixtureEntity,
    ScrimState,
    UserEntity,
} from '../../src/db/internal';
import * as dotenv from 'dotenv';
dotenv.config();

// Use environment variables or defaults matching docker-compose
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432');
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_NAME = process.env.DB_NAME || 'postgres';

describe('Multi-Game Data Model E2E', () => {
    let module: TestingModule;
    let dataSource: DataSource;

    const allEntities = Object.values(internal).filter(x => 
        typeof x === 'function' && 
        x.name && 
        x.name.endsWith('Entity')
    );

    beforeAll(async () => {
        // Create schema 'sprocket' if not exists
        const { Client } = require('pg');
        const client = new Client({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        });
        await client.connect();
        await client.query('CREATE SCHEMA IF NOT EXISTS sprocket');
        await client.end();

        module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'postgres',
                    host: DB_HOST,
                    port: DB_PORT,
                    username: DB_USER,
                    password: DB_PASSWORD,
                    database: DB_NAME,
                    entities: allEntities,
                    synchronize: true, 
                    logging: false,
                }),
                TypeOrmModule.forFeature(allEntities),
            ],
        }).compile();

        dataSource = module.get<DataSource>(DataSource);
    });

    afterAll(async () => {
        if (module) await module.close();
    });

    it('should fullfil Rocket League Scrim flow', async () => {
        const gameRepo = dataSource.getRepository(GameEntity);
        const gameModeRepo = dataSource.getRepository(GameModeEntity);
        const scrimRepo = dataSource.getRepository(ScrimEntity);
        const roundRepo = dataSource.getRepository(RoundEntity);
        const playerStatRepo = dataSource.getRepository(PlayerStatEntity);

        // 1. Create/Find Game
        let game = await gameRepo.findOne({ where: { name: 'Rocket League E2E' } });
        if (!game) {
             game = await gameRepo.save(
                gameRepo.create({
                    name: 'Rocket League E2E',
                    statDefinitions: { goals: 'number', assists: 'number' },
                }),
            );
        }

        // 2. Create/Find GameMode
        let gameMode = await gameModeRepo.findOne({ where: { game: { id: game.id }, name: 'Standard E2E' } });
        if (!gameMode) {
             gameMode = await gameModeRepo.save(
                gameModeRepo.create({
                    game: game,
                    name: 'Standard E2E',
                    playerCount: 6,
                    teamSize: 3,
                }),
            );
        }

        // 0. Create User for Scrim Author
        const userRepo = dataSource.getRepository(UserEntity);
        // We might need to handle User constraints?
        // Assuming minimal user works or fake data factory.
        // UserEntity usually has Profile? 
        // Let's look at UserEntity if needed, but trying simple save first.
        let user = await userRepo.save(
            userRepo.create({
                username: 'TestUser',
            })
        );
        // If save fails, we check requirements.

        // 3. Create Scrim
        const scrim = await scrimRepo.save(
            scrimRepo.create({
                game: game,
                gameMode: gameMode,
                authorId: user.id, 
                status: MatchStatus.IN_PROGRESS, // BaseMatch status
                state: ScrimState.IN_PROGRESS,   // Scrim specific state
                maxPlayers: 6,
                settings: { map: 'Mannfield' },
                players: [] // ManyToMany
            }),
        );
        expect(scrim.id).toBeDefined();

        // 4. Create Round
        const round = await roundRepo.save(
            roundRepo.create({
                match: scrim,
                roundNumber: 1,
                metadata: { mutators: 'none' },
            }),
        );

        // 5. Create Player Stat
        const playerStat = await playerStatRepo.save(
            playerStatRepo.create({
                round: round,
                stats: { score: 500, goals: 3, assists: 1 },
            }),
        );

        // Verify Fetch
        const savedScrim = await scrimRepo.findOne({
            where: { id: scrim.id },
            relations: ['rounds', 'rounds.playerStats'],
        });

        expect(savedScrim).toBeDefined();
        expect(savedScrim?.rounds).toHaveLength(1);
        expect(savedScrim?.rounds[0].metadata).toEqual({ mutators: 'none' });
        expect(savedScrim?.rounds[0].playerStats[0].stats).toEqual({ score: 500, goals: 3, assists: 1 });
    });

    it('should fullfil Trackmania Fixture flow', async () => {
        const gameRepo = dataSource.getRepository(GameEntity);
        const fixtureRepo = dataSource.getRepository(FixtureEntity);
        const roundRepo = dataSource.getRepository(RoundEntity);
        const playerStatRepo = dataSource.getRepository(PlayerStatEntity);

        // 1. Create Game
        let game = await gameRepo.findOne({ where: { name: 'Trackmania E2E' } });
        if (!game) {
            game = await gameRepo.save(
                gameRepo.create({
                    name: 'Trackmania E2E',
                    statDefinitions: { time: 'number' },
                }),
            );
        }

        // 2. Create Fixture
        const fixture = await fixtureRepo.save(
            fixtureRepo.create({
                game: game,
                status: MatchStatus.COMPLETED,
            }),
        );
        expect(fixture.id).toBeDefined();

        // 3. Create Round
        const round = await roundRepo.save(
            roundRepo.create({
                match: fixture,
                roundNumber: 1,
                metadata: { mapUid: 'XJ_12345' },
            }),
        );

        // 4. Create Player Stat
        const playerStat = await playerStatRepo.save(
            playerStatRepo.create({
                round: round,
                stats: { time: 45123 },
            }),
        );

        const savedFixture = await fixtureRepo.findOne({
            where: { id: fixture.id },
            relations: ['rounds', 'rounds.playerStats'],
        });

        expect(savedFixture).toBeDefined();
        expect(savedFixture?.rounds[0].playerStats[0].stats).toEqual({ time: 45123 });
    });
});
