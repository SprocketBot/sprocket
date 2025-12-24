import { ChildEntity, ManyToOne, JoinColumn } from 'typeorm';
import { MatchEntity, FranchiseEntity } from '../internal';

@ChildEntity('fixture')
export class FixtureEntity extends MatchEntity {
    @ManyToOne(() => FranchiseEntity)
    @JoinColumn()
    homeFranchise: FranchiseEntity;

    @ManyToOne(() => FranchiseEntity)
    @JoinColumn()
    awayFranchise: FranchiseEntity;
}
