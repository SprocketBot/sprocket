import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataAuditLog } from '../db/internal';
import { AuditService } from './audit.service';

@Module({
    imports: [TypeOrmModule.forFeature([DataAuditLog])],
    providers: [AuditService],
    exports: [AuditService],
})
export class AuditModule { }
