import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {Invalidation, Match, Round} from "../../database";

@Injectable()
export class RoundService {
    constructor(
        @InjectRepository(Round) private roundRepo: Repository<Round>,
        @InjectRepository(Match) private matchRepo: Repository<Match>,
        @InjectRepository(Invalidation)
        private invalidationRepo: Repository<Invalidation>,
    ) {}

    async createRound(
        matchId: number,
        stats: unknown,
        isDummy?: boolean,
        invalidationId?: number,
    ): Promise<Round> {
        const match = await this.matchRepo.findOneOrFail({
            where: {id: matchId},
        });
        let invalidation: Invalidation | undefined;
        if (invalidationId)
            invalidation = await this.invalidationRepo.findOneOrFail({
                where: {id: invalidationId},
            });

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
