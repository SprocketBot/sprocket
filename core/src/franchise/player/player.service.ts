import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {FindOneOptions} from "typeorm";
import {Repository} from "typeorm";

import {Player} from "../../database";
import {MemberService} from "../../organization";
import {GameSkillGroupService} from "../game-skill-group";

@Injectable()
export class PlayerService {
    constructor(
        @InjectRepository(Player) private playerRepository: Repository<Player>,
        private readonly memberService: MemberService,
        private readonly skillGroupService: GameSkillGroupService,
    ) {}

    async getPlayer(query: FindOneOptions<Player>): Promise<Player> {
        return this.playerRepository.findOneOrFail(query);
    }

    async getPlayerById(id: number): Promise<Player> {
        return this.playerRepository.findOneOrFail(id);
    }

    async createPlayer(memberId: number, skillGroupId: number, salary: number): Promise<Player> {
        const member = await this.memberService.getMemberById(memberId);
        const skillGroup = await this.skillGroupService.getGameSkillGroupById(skillGroupId);
        const player = this.playerRepository.create({
            member, skillGroup, salary,
        });

        await this.playerRepository.save(player);
        return player;
    }
}
