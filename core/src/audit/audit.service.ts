import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataAuditLog, DataAuditAction } from '../db/internal';

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(DataAuditLog)
        private readonly auditRepo: Repository<DataAuditLog>,
    ) { }

    async log(
        entityName: string,
        entityId: string,
        action: DataAuditAction,
        details: {
            actorId?: number;
            previousData?: Record<string, any>;
            newData?: Record<string, any>;
        },
    ): Promise<void> {
        const logEntry = this.auditRepo.create({
            entityName,
            entityId,
            action,
            actorId: details.actorId,
            previousData: details.previousData,
            newData: details.newData,
        });
        await this.auditRepo.save(logEntry);
    }
}
