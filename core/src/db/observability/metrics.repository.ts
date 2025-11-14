import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MetricsEntity, MetricType } from './metrics.entity';

@Injectable()
export class MetricsRepository extends Repository<MetricsEntity> {
    constructor(private dataSource: DataSource) {
        super(MetricsEntity, dataSource.createEntityManager());
    }

    async findByName(name: string, limit = 100): Promise<MetricsEntity[]> {
        return this.find({
            where: { name },
            order: { timestamp: 'DESC' },
            take: limit
        });
    }

    async findByService(service: string, limit = 100): Promise<MetricsEntity[]> {
        return this.find({
            where: { service },
            order: { timestamp: 'DESC' },
            take: limit
        });
    }

    async findByUserId(userId: string, limit = 100): Promise<MetricsEntity[]> {
        return this.find({
            where: { userId },
            order: { timestamp: 'DESC' },
            take: limit
        });
    }

    async findByTraceId(traceId: string): Promise<MetricsEntity[]> {
        return this.find({ where: { traceId } });
    }

    async findRecent(limit = 100): Promise<MetricsEntity[]> {
        return this.find({
            order: { timestamp: 'DESC' },
            take: limit
        });
    }

    async incrementCounter(
        name: string,
        service: string,
        labels?: Record<string, string>,
        value = 1
    ): Promise<MetricsEntity> {
        const metric = this.create({
            name,
            value,
            type: MetricType.COUNTER,
            service,
            labels,
            timestamp: new Date()
        });
        return this.save(metric);
    }

    async recordGauge(
        name: string,
        value: number,
        service: string,
        labels?: Record<string, string>
    ): Promise<MetricsEntity> {
        const metric = this.create({
            name,
            value,
            type: MetricType.GAUGE,
            service,
            labels,
            timestamp: new Date()
        });
        return this.save(metric);
    }

    async recordHistogram(
        name: string,
        value: number,
        service: string,
        labels?: Record<string, string>
    ): Promise<MetricsEntity> {
        const metric = this.create({
            name,
            value,
            type: MetricType.HISTOGRAM,
            service,
            labels,
            timestamp: new Date()
        });
        return this.save(metric);
    }

    async deleteOldMetrics(daysToKeep = 7): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const result = await this.createQueryBuilder()
            .delete()
            .where('timestamp < :cutoffDate', { cutoffDate })
            .execute();

        return result.affected || 0;
    }
}