import { ChildEntity, ManyToOne, JoinColumn } from 'typeorm';
import { MatchEntity } from '../match/match.entity';
import { FranchiseEntity } from '../franchise/franchise.entity';

@ChildEntity('fixture')
export class FixtureEntity extends MatchEntity {
    @ManyToOne(() => FranchiseEntity)
    @JoinColumn()
    homeFranchise: FranchiseEntity;

    @ManyToOne(() => FranchiseEntity)
    @JoinColumn()
    awayFranchise: FranchiseEntity;
}
