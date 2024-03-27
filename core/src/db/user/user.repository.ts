import { Injectable } from '@nestjs/common';
import { Raw, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    baseRepository: Repository<UserEntity>,
  ) {
    super(
      baseRepository.target,
      baseRepository.manager,
      baseRepository.queryRunner,
    );
  }

  async search(
    term: string,
    limit: number = 10,
    threshold: number = 0,
  ): Promise<UserEntity[]> {
    const qb = this.createQueryBuilder();

    const result = await qb
      .select('*')
      .addSelect(`similarity(username::text, '${term}'::text)`)
      .orderBy(`similarity(username::text, '${term}'::text)`, 'DESC')
      .limit(limit);

    if (threshold) {
      result.where(
        `similarity(username::text, '${term}'::text) >= ${threshold}`,
      );
    }

    return await result.execute();
  }
}
