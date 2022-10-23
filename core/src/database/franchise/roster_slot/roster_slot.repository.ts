import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories/repository";
import {RosterSlot} from "./roster_slot.model";

@Injectable()
export class RosterSlotRepository extends ExtendedRepository<RosterSlot> {
    constructor(readonly dataSource: DataSource) {
        super(RosterSlot, dataSource);
    }
}
