import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ScrimRepository } from '../../db/scrim/scrim.repository';
import { ScrimState } from '../constants';
import { ScrimCrudService } from '../scrim-crud/scrim-crud.service';
import { LessThan } from 'typeorm';

@Injectable()
export class TimeoutService {
    constructor(
        private readonly scrimRepository: ScrimRepository,
        private readonly scrimCrudService: ScrimCrudService,
    ) { }

    async setPendingTimeout(scrimId: string, timeout: number): Promise<void> {
        const entity = await this.scrimRepository.findOne({ where: { id: scrimId } });
        if (!entity) return;
        entity.pendingExpiresAt = new Date(Date.now() + timeout);
        await this.scrimRepository.save(entity);
    }

    async getPendingTTL(scrimId: string): Promise<number> {
        const entity = await this.scrimRepository.findOne({ where: { id: scrimId } });
        if (!entity || !entity.pendingExpiresAt) return 0;
        return Math.max(0, entity.pendingExpiresAt.getTime() - Date.now());
    }

    async setPoppedTimeout(scrimId: string, timeout: number): Promise<void> {
        const entity = await this.scrimRepository.findOne({ where: { id: scrimId } });
        if (!entity) return;
        entity.poppedExpiresAt = new Date(Date.now() + timeout);
        await this.scrimRepository.save(entity);
    }

    async getPoppedTTL(scrimId: string): Promise<number> {
        const entity = await this.scrimRepository.findOne({ where: { id: scrimId } });
        if (!entity || !entity.poppedExpiresAt) return 0;
        return Math.max(0, entity.poppedExpiresAt.getTime() - Date.now());
    }

    @Cron('*/1 * * * *')
    async handlePendingTimeouts() {
        const expired = await this.scrimRepository.find({
            where: { state: ScrimState.PENDING, pendingExpiresAt: LessThan(new Date()) },
        });
        for (const e of expired) {
            await this.scrimCrudService.destroyScrim(e.id);
            // Update state to cancelled after destruction
            e.state = ScrimState.CANCELLED;
            await this.scrimRepository.save(e);
        }
    }

    @Cron('*/1 * * * *')
    async handlePoppedTimeouts() {
        const expired = await this.scrimRepository.find({
            where: { state: ScrimState.POPPED, poppedExpiresAt: LessThan(new Date()) },
        });
        for (const e of expired) {
            await this.scrimCrudService.destroyScrim(e.id);
        }
    }
}