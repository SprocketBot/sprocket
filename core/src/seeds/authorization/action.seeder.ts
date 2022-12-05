import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {Action} from "../../database/authorization/action";
import type {SmartSeeder} from "../types";
import {ActionFixtures} from "./action.fixture";

@Injectable()
export class ActionSeeder implements SmartSeeder<Action> {
    created: Action[] = [];

    constructor(@InjectRepository(Action) private readonly listRepo: Repository<Action>) {}

    async drop(): Promise<void> {
        await this.listRepo.softDelete({});
    }

    async seed(): Promise<void> {
        const actions = ActionFixtures;
        const results = await this.listRepo.save(actions);
        this.created.push(...results);
    }
}
