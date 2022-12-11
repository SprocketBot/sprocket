import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../types/extended-repositories";
import {RosterSlot} from "./roster-slot.entity";

@Injectable()
export class RosterSlotRepository extends ExtendedRepository<RosterSlot> {
    constructor(readonly dataSource: DataSource) {
        super(RosterSlot, dataSource);
    }
}
