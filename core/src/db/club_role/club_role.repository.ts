import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ClubRoleEntity } from './club_role.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ClubRoleRepository extends Repository<ClubRoleEntity> {
    constructor(
        @InjectRepository(ClubRoleEntity)
        baseRepository: Repository<ClubRoleEntity>
    ) {
        super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
    }
}
