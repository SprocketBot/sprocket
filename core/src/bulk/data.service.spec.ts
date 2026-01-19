import { Test, TestingModule } from '@nestjs/testing';
import { DataService } from './data.service';
import { DataSource } from 'typeorm';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('DataService', () => {
    let service: DataService;
    let dataSource: DataSource;

    const mockRepo = {
        find: vi.fn().mockResolvedValue([{ id: '1', name: 'Test' }]),
        target: 'TestEntity',
    };

    const mockDataSource = {
        getRepository: vi.fn().mockReturnValue(mockRepo),
        transaction: vi.fn().mockImplementation((cb) => cb({
            save: vi.fn().mockResolvedValue([{ id: '1' }, { id: '2' }]),
        })),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DataService,
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile();

        service = module.get<DataService>(DataService);
        dataSource = module.get<DataSource>(DataSource);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should export to JSON', async () => {
        const result = await service.exportToJson('Franchise');
        expect(result).toContain('"name": "Test"');
        expect(mockDataSource.getRepository).toHaveBeenCalled();
    });

    it('should export to CSV', async () => {
        const result = await service.exportToCsv('Franchise');
        expect(result).toContain('id,name');
        expect(result).toContain('"1","Test"');
    });

    it('should import from JSON', async () => {
        const json = '[{"name": "New"}]';
        const result = await service.importFromJson('Franchise', json);
        expect(result).toBe(2);
        expect(mockDataSource.transaction).toHaveBeenCalled();
    });
});
