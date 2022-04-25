import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {
    Invalidation, Match, Round,
} from "src/database";
import {Repository} from "typeorm";

@Injectable()
export class RoundService {
    constructor(
        @InjectRepository(Round) private roundRepo: Repository<Round>,
        @InjectRepository(Match) private matchRepo: Repository<Match>,
        @InjectRepository(Invalidation) private invalidationRepo: Repository<Invalidation>,
    ) {}

    async createRound(matchId: number, stats: unknown, isDummy?: boolean, invalidationId?: number): Promise<Round> {
        const match = await this.matchRepo.findOneOrFail(matchId);
        let invalidation: Invalidation | undefined;
        if (invalidationId) invalidation = await this.invalidationRepo.findOneOrFail(invalidationId);

        const round = this.roundRepo.create({
            match: match,
            roundStats: stats,
            isDummy: isDummy,
            homeWon: false, // TODO
            invalidation: invalidation,
        });

        return this.roundRepo.save(round);
    }
}
