import {
    forwardRef, Inject, Injectable,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import type {CoreEndpoint, CoreOutput} from "@sprocketbot/common";
import type {FindOneOptions} from "typeorm";
import {Repository} from "typeorm";

import {FranchiseProfile} from '$db/franchise/franchise_profile/franchise_profile.model';
import {Franchise} from '$db/franchise/franchise/franchise.model';
import {MledbPlayerService} from "../../mledb";
import {MemberService} from "../../organization";
import {PlayerService} from "../player";

@Injectable()
export class FranchiseService {
    constructor(
    @InjectRepository(Franchise)
    private readonly franchiseRepository: Repository<Franchise>,
    @Inject(forwardRef(() => MledbPlayerService))
    private readonly mledbPlayerService: MledbPlayerService,
    private readonly sprocketMemberService: MemberService,
    @InjectRepository(FranchiseProfile)
    private readonly franchiseProfileRepository: Repository<FranchiseProfile>,
    ) {}

    async getFranchiseProfile(franchiseId: number): Promise<FranchiseProfile> {
        const franchise = await this.franchiseRepository.findOneOrFail({
            where: {id: franchiseId},
            relations: ["profile"],
        });
        return franchise.profile;
    }

    async getFranchiseById(franchiseId: number): Promise<Franchise> {
        return this.franchiseRepository.findOneOrFail({
            where: {id: franchiseId},
        });
    }

    async getFranchise(query: FindOneOptions<Franchise>): Promise<Franchise> {
        return this.franchiseRepository.findOneOrFail(query);
    }

    async getFranchiseByName(name: string): Promise<Franchise> {
        const profile = await this.franchiseProfileRepository.findOneOrFail({
            where: {
                title: name,
            },
            relations: {
                franchise: true,
            }
        });
        
        // Have to go back to the DB to get the franchise object with its
        // profile, rather than the profile with the franchise we had above
        return this.getFranchise({
            where: { id: profile.franchise.id },
            relations: { profile: true }
        });
    }

    async getPlayerFranchisesByMemberId(memberId: number): Promise<CoreOutput<CoreEndpoint.GetPlayerFranchises>> {
        const member = await this.sprocketMemberService.getMemberById(memberId);
        const {userId} = member;
        const mlePlayer = await this.mledbPlayerService.getMlePlayerBySprocketUser(userId);

        const playerId = mlePlayer.id;

        const team = await this.mledbPlayerService.getPlayerFranchise(playerId);
        const isCaptain = await this.mledbPlayerService.playerIsCaptain(playerId);

        const staffPositions: Array<{id: number; name: string;}> = [];

        if (team.franchiseManagerId === playerId) {
            staffPositions.push({id: 0, name: "FM"});
        }
        if (team.generalManagerId === playerId) {
            staffPositions.push({id: 0, name: "GM"});
        }
        if (
            team.doublesAssistantGeneralManagerId === playerId
      || team.standardAssistantGeneralManagerId === playerId
        ) {
            staffPositions.push({id: 0, name: "AGM"});
        }
        if (isCaptain) {
            staffPositions.push({id: 0, name: "CAP"});
        }

        return [
            {
                id: 0,
                name: team.name,
                staffPositions: staffPositions,
            },
        ];
    }
}
