import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {DataFactory} from "nestjs-seeder";
import {Repository} from "typeorm";

import {Player} from "../../database/franchise/player";
import type {SmartSeeder} from "../types";

@Injectable()
export class PlayerSeeder implements SmartSeeder<Player> {
    created: Player[] = [];

    constructor(@InjectRepository(Player) private readonly listRepo: Repository<Player>) {}

    async drop(): Promise<void> {
        await this.listRepo.softDelete({});
    }

    async seed(): Promise<void> {
        const factory = DataFactory.createForClass(Player);
        const players = factory.generate(5);
        const results = await this.listRepo.save(players);
        this.created.push(...results);
    }
}
