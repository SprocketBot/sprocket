import { Test, TestingModule } from '@nestjs/testing';
import { BulkService } from './bulk.service';
import { DataSource } from 'typeorm';
import { UserEntity } from '../db/user/user.entity';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('BulkService', () => {
    let service: BulkService;
    let dataSource: DataSource;

    const mockManager = {
        createQueryBuilder: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        whereInIds: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ affected: 2 }),
    };

    const mockDataSource = {
        transaction: vi.fn().mockImplementation((cb) => cb(mockManager)),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BulkService,
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile();

        service = module.get<BulkService>(BulkService);
        dataSource = module.get<DataSource>(DataSource);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should bulk activate users', async () => {
        const userIds = ['uuid1', 'uuid2'];
        const result = await service.bulkActivateUsers(userIds);
        expect(result).toBe(2);
        expect(mockDataSource.transaction).toHaveBeenCalled();
        expect(mockManager.update).toHaveBeenCalledWith(UserEntity);
        expect(mockManager.set).toHaveBeenCalledWith({ active: true });
        expect(mockManager.whereInIds).toHaveBeenCalledWith(userIds);
    });

    it('should bulk deactivate users', async () => {
        const userIds = ['uuid1', 'uuid2'];
        const result = await service.bulkDeactivateUsers(userIds);
        expect(result).toBe(2);
        expect(mockDataSource.transaction).toHaveBeenCalled();
        expect(mockManager.update).toHaveBeenCalledWith(UserEntity);
        expect(mockManager.set).toHaveBeenCalledWith({ active: false });
        expect(mockManager.whereInIds).toHaveBeenCalledWith(userIds);
    });
});
