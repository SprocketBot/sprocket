import { Injectable } from '@nestjs/common';
import { RosterSpotRepository } from '../../db/roster_spot/roster_spot.repository';
import { RosterOfferRepository } from '../../db/roster_offer/roster_offer.repository';
import { TeamRepository } from '../../db/team/team.repository';
import { PlayerRepository } from '../../db/player/player.repository';
import { RosterStatus } from '../../db/roster_spot/roster_spot.entity';

@Injectable()
export class RosterService {
	constructor(
		private readonly rosterSpotRepo: RosterSpotRepository,
		private readonly rosterOfferRepo: RosterOfferRepository,
		private readonly teamRepo: TeamRepository,
		private readonly playerRepo: PlayerRepository,
	) {}

	async getRosterSpotsForTeam(teamId: string): Promise<any[]> {
		return this.rosterSpotRepo.find({
			where: { team: { id: teamId } },
			relations: ['player', 'player.user'],
		});
	}

	async addPlayerToRoster(teamId: string, playerId: string): Promise<any> {
		const team = await this.teamRepo.findOneOrFail({ where: { id: teamId } });
		const player = await this.playerRepo.findOneOrFail({ where: { id: playerId } });
		
		// Logic to check roster limits and existing spots would go here
		
		const spot = this.rosterSpotRepo.create({
			team,
			player,
			status: RosterStatus.ACTIVE,
			joinedAt: new Date(),
		});
		
		return this.rosterSpotRepo.save(spot);
	}
}
