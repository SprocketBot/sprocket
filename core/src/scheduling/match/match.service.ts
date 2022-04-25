import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Invalidation, Match} from "src/database";
import {Repository} from "typeorm";

@Injectable()
export class MatchService {
    constructor(
        @InjectRepository(Match) private matchRepo: Repository<Match>,
        @InjectRepository(Invalidation) private invalidationRepo: Repository<Invalidation>,
    ) {}

    async createMatch(isDummy?: boolean, invalidationId?: number): Promise<Match> {
        let invalidation: Invalidation | undefined;
        if (invalidationId) invalidation = await this.invalidationRepo.findOneOrFail(invalidationId);

        const match = this.matchRepo.create({
            isDummy: isDummy,
            invalidation: invalidation,
            rounds: [],
        });

        return this.matchRepo.save(match);
    }
}
