import {Injectable} from "@nestjs/common";
import type {Duration} from "date-fns";
import {add} from "date-fns";
import {Between, MoreThan} from "typeorm";

import {ScrimMetaRepository} from "$repositories";
import {Period} from "$util/types/period.enum";

@Injectable()
export class ScrimMetaCrudService {
    constructor(private readonly scrimMetaRepository: ScrimMetaRepository) {}

    async getScrimCountInPreviousPeriod(p: Period, previousPeriod = false): Promise<number> {
        let increment: Duration;

        const UTCHourOffset = new Date().getTimezoneOffset() * -1;

        switch (p) {
            case Period.DAY:
                increment = {days: -1};
                break;
            case Period.HOUR:
                increment = {hours: -1};
                break;
            default:
                throw new Error(`Unsupported Period Type ${p}`);
        }
        if (previousPeriod) {
            return this.scrimMetaRepository.count({
                where: {
                    createdAt: Between(
                        add(add(add(new Date(), increment), increment), {
                            hours: UTCHourOffset,
                        }),
                        add(add(new Date(), increment), {hours: UTCHourOffset}),
                    ),
                },
            });
        }
        return this.scrimMetaRepository.count({
            where: {
                createdAt: MoreThan(add(add(new Date(), increment), {hours: UTCHourOffset})),
            },
        });
    }
}
