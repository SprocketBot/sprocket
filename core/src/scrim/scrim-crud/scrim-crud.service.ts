import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Duration } from 'date-fns';
import { add } from 'date-fns';
import { Between, MoreThan, Repository } from 'typeorm';

import { ScrimMeta } from '$db/scheduling/saved_scrim/scrim.model';

import { Period } from '../../util/types/period.enum';

@Injectable()
export class ScrimMetaCrudService {
  constructor(@InjectRepository(ScrimMeta) private readonly scrimRepo: Repository<ScrimMeta>) {}

  async getScrimCountInPreviousPeriod(p: Period, previousPeriod: boolean = false): Promise<number> {
    let increment: Duration;

    const UTCHourOffset = new Date().getTimezoneOffset() * -1;

    switch (p) {
      case Period.DAY:
        increment = { days: -1 };
        break;
      case Period.HOUR:
        increment = { hours: -1 };
        break;
      default:
        throw new Error(`Unsupported Period Type ${p}`);
    }
    if (previousPeriod) {
      return this.scrimRepo.count({
        where: {
          createdAt: Between(
            add(add(add(new Date(), increment), increment), { hours: UTCHourOffset }),
            add(add(new Date(), increment), { hours: UTCHourOffset }),
          ),
        },
      });
    }
    return this.scrimRepo.count({
      where: {
        createdAt: MoreThan(add(add(new Date(), increment), { hours: UTCHourOffset })),
      },
    });
  }
}
