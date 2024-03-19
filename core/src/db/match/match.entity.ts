import { Check, Entity } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity('match')
export class MatchEntity extends BaseEntity {}

/*
    Important Note:
    MatchEntity and ScrimEntity both use Postgres inheritance behind the scenes
 */

@Entity('fixture')
export class FixtureEntity extends MatchEntity {}

@Entity('scrim')
export class ScrimEntity extends MatchEntity {}
