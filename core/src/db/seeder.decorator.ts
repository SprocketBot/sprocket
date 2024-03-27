import { SetMetadata } from '@nestjs/common';
import { EntityManager } from 'typeorm';

export const Seed = () => SetMetadata('seeder', true);

export interface Seeder {
  seed(em: EntityManager): Promise<void>;
}
