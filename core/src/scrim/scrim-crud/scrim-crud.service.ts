import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {add} from "date-fns";
import {
    Between,
    Repository,
} from "typeorm";

import {ScrimMeta} from "../../database";
import {Period} from "../../util/types/period.enum";


@Injectable()
export class ScrimMetaCrudService {

    constructor(@InjectRepository(ScrimMeta) private readonly scrimRepo: Repository<ScrimMeta>) {}

    async getScrimCountInPreviousPeriod(p: Period, previousPeriod: boolean = false): Promise<number> {
        let from = new Date();
        let to = new Date();
        switch (p) {
            case Period.DAY:
                to = add(to, {days: -1});
                if (previousPeriod) from = add(from, {days: -1});
                break;
            case Period.HOUR:
                to = add(to, {hours: -1});
                if (previousPeriod) from = add(from, {hours: -1});
                break;
            default:
                break;
        }

        return this.scrimRepo.count({
            where: {
                createdAt: Between(from, to),
            },
        });
    }
}
