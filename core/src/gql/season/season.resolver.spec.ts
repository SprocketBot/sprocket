import { Test, TestingModule } from '@nestjs/testing';
import { SeasonResolver } from './season.resolver';
import { SeasonService } from './season.service';
import { SeasonObject, CreateSeasonInput, UpdateSeasonInput } from './season.object';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SeasonStatus } from '../../db/season/season.entity';
import { AuthenticateService } from '../../auth/authenticate/authenticate.service';
import { AuthorizeService } from '../../auth/authorize/authorize.service';

describe('SeasonResolver', () => {
    let resolver: SeasonResolver;
    let service: SeasonService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SeasonResolver,
                {
                    provide: SeasonService,
                    useValue: {
                        getSeasonById: vi.fn(),
                        getAllSeasons: vi.fn(),
                        getSeasonsPaginated: vi.fn(),
                        createSeason: vi.fn(),
                        updateSeason: vi.fn(),
                        deleteSeason: vi.fn(),
                    },
                },
                {
                    provide: AuthenticateService,
                    useValue: {},
                },
                {
                    provide: AuthorizeService,
                    useValue: {},
                },
            ],
        }).compile();

        resolver = module.get<SeasonResolver>(SeasonResolver);
        service = module.get<SeasonService>(SeasonService);
    });

    it('should be defined', () => {
        expect(resolver).toBeDefined();
    });

    describe('seasons', () => {
        it('should return a paginated response of seasons', async () => {
            const items = [new SeasonObject()];
            const total = 1;
            const pagination = { offset: 0, limit: 25 };
            vi.spyOn(service, 'getSeasonsPaginated').mockResolvedValue([items as any, total]);

            const result = await resolver.seasons(pagination);
            expect(result).toEqual({
                items,
                total,
                offset: pagination.offset,
                limit: pagination.limit,
            });
            expect(service.getSeasonsPaginated).toHaveBeenCalledWith(pagination, undefined, undefined);
        });
    });

    describe('season', () => {
        it('should return a single season', async () => {
            const result = new SeasonObject();
            vi.spyOn(service, 'getSeasonById').mockResolvedValue(result as any);

            expect(await resolver.season('1')).toBe(result);
        });
    });

    describe('createSeason', () => {
        it('should create a season', async () => {
            const input: CreateSeasonInput = {
                name: 'Season 1',
                slug: 'season-1',
                number: 1,
                startDate: new Date(),
                endDate: new Date(),
                status: SeasonStatus.UPCOMING,
                isOffseason: false,
            };
            const result = new SeasonObject();
            vi.spyOn(service, 'createSeason').mockResolvedValue(result as any);

            expect(await resolver.createSeason(input)).toBe(result);
            expect(service.createSeason).toHaveBeenCalledWith(input);
        });
    });

    describe('updateSeason', () => {
        it('should update a season', async () => {
            const input: UpdateSeasonInput = {
                name: 'Updated Season',
            };
            const result = new SeasonObject();
            vi.spyOn(service, 'updateSeason').mockResolvedValue(result as any);

            expect(await resolver.updateSeason('1', input)).toBe(result);
            expect(service.updateSeason).toHaveBeenCalledWith('1', input);
        });
    });

    describe('deleteSeason', () => {
        it('should delete a season', async () => {
            const result = new SeasonObject();
            vi.spyOn(service, 'deleteSeason').mockResolvedValue(result as any);

            expect(await resolver.deleteSeason('1')).toBe(result);
            expect(service.deleteSeason).toHaveBeenCalledWith('1');
        });
    });
});


