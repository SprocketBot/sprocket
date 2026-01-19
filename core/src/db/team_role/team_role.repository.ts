import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TeamRoleEntity } from './team_role.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TeamRoleRepository extends Repository<TeamRoleEntity> {
    constructor(
        @InjectRepository(TeamRoleEntity)
        baseRepository: Repository<TeamRoleEntity>
    ) {
        super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
    }
}
