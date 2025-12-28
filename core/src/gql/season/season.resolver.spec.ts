import { Test, TestingModule } from '@nestjs/testing';
import { SeasonResolver } from './season.resolver';
import { SeasonService } from './season.service';
import { SeasonObject } from './season.object';
import { describe, it, expect, beforeEach, vi } from 'vitest';

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
                    },
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
        it('should return an array of seasons', async () => {
            const result = [new SeasonObject()];
            vi.spyOn(service, 'getAllSeasons').mockResolvedValue(result as any);

            expect(await resolver.seasons()).toBe(result);
        });
    });

    describe('season', () => {
        it('should return a single season', async () => {
            const result = new SeasonObject();
            vi.spyOn(service, 'getSeasonById').mockResolvedValue(result as any);

            expect(await resolver.season('1')).toBe(result);
        });
    });
});


