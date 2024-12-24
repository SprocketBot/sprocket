import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RoleEntity } from './role.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RoleRepository extends Repository<RoleEntity> {
  constructor(
    @InjectRepository(RoleEntity)
    baseRepository: Repository<RoleEntity>,
  ) {
    super(
      baseRepository.target,
      baseRepository.manager,
      baseRepository.queryRunner,
    );
  }
}
