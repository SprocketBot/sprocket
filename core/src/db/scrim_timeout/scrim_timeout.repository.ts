import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScrimTimeoutEntity } from './scrim_timeout.entity';

@Injectable()
export class ScrimTimeoutRepository extends Repository<ScrimTimeoutEntity> {
    constructor(
        @InjectRepository(ScrimTimeoutEntity)
        private repository: Repository<ScrimTimeoutEntity>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }
}