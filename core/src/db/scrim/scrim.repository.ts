import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScrimEntity } from './scrim.entity';

@Injectable()
export class ScrimRepository extends Repository<ScrimEntity> {
    constructor(
        @InjectRepository(ScrimEntity)
        private repository: Repository<ScrimEntity>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }
}