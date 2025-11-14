import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LogsEntity, LogLevel } from './logs.entity';

@Injectable()
export class LogsRepository extends Repository<LogsEntity> {
    constructor(private dataSource: DataSource) {
        super(LogsEntity, dataSource.createEntityManager());
    }

    async findByTraceId(traceId: string): Promise<LogsEntity[]> {
        return this.find({ where: { traceId } });
    }

    async findByRequestId(requestId: string): Promise<LogsEntity[]> {
        return this.find({ where: { requestId } });
    }

    async findByUserId(userId: string, limit = 100): Promise<LogsEntity[]> {
        return this.find({
            where: { userId },
            order: { timestamp: 'DESC' },
            take: limit
        });
    }

    async findByLevel(level: LogLevel, limit = 100): Promise<LogsEntity[]> {
        return this.find({
            where: { level },
            order: { timestamp: 'DESC' },
            take: limit
        });
    }

    async findByService(service: string, limit = 100): Promise<LogsEntity[]> {
        return this.find({
            where: { service },
            order: { timestamp: 'DESC' },
            take: limit
        });
    }

    async findRecent(limit = 100): Promise<LogsEntity[]> {
        return this.find({
            order: { timestamp: 'DESC' },
            take: limit
        });
    }

    async deleteOldLogs(daysToKeep = 30): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const result = await this.createQueryBuilder()
            .delete()
            .where('timestamp < :cutoffDate', { cutoffDate })
            .execute();

        return result.affected || 0;
    }
}