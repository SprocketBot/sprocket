import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserEntity } from '../db/user/user.entity';

@Injectable()
export class BulkService {
    private readonly logger = new Logger(BulkService.name);

    constructor(private readonly dataSource: DataSource) { }

    async bulkActivateUsers(userIds: string[]): Promise<number> {
        return this.dataSource.transaction(async (manager) => {
            const result = await manager
                .createQueryBuilder()
                .update(UserEntity)
                .set({ active: true })
                .whereInIds(userIds)
                .execute();

            return result.affected ?? 0;
        });
    }

    async bulkDeactivateUsers(userIds: string[]): Promise<number> {
        return this.dataSource.transaction(async (manager) => {
            const result = await manager
                .createQueryBuilder()
                .update(UserEntity)
                .set({ active: false })
                .whereInIds(userIds)
                .execute();

            return result.affected ?? 0;
        });
    }
}
