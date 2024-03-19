import { Check, Entity } from 'typeorm';
import { BaseEntity } from '../base.entity';

abstract class BaseMatchEntity extends BaseEntity {}

@Entity('match', { schema: 'sprocket' })
@Check('(false) no inherit')
export class MatchEntity extends BaseMatchEntity {
  // Fields should not go here, but instead into BaseMatchEntity
  // This class exists so that a check can be applied to _only_
  // the match table, while still being created for postgres inheritance
}

/*
    Important Note:
    MatchEntity and ScrimEntity both use Postgres inheritance behind the scenes
 */

@Entity('fixture', { schema: 'sprocket' })
export class FixtureEntity extends BaseMatchEntity {}

@Entity('scrim', { schema: 'sprocket' })
export class ScrimEntity extends BaseMatchEntity {}
