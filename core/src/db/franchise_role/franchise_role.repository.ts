import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FranchiseRoleEntity } from './franchise_role.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FranchiseRoleRepository extends Repository<FranchiseRoleEntity> {
    constructor(
        @InjectRepository(FranchiseRoleEntity)
        baseRepository: Repository<FranchiseRoleEntity>
    ) {
        super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
    }
}
