import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScrimQueueEntity } from './scrim_queue.entity';

@Injectable()
export class ScrimQueueRepository extends Repository<ScrimQueueEntity> {
    constructor(
        @InjectRepository(ScrimQueueEntity)
        private repository: Repository<ScrimQueueEntity>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }
}