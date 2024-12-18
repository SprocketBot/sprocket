import { Query, Resolver } from '@nestjs/graphql';
import { OrgMetricsObject } from './org-metrics.object';
import { UserRepository } from '../../db/user/user.repository';
import { PlayerRepository } from '../../db/player/player.repository';

@Resolver()
export class MetricsResolver {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly playerRepo: PlayerRepository,
  ) {}

  @Query(() => OrgMetricsObject)
  async getOrganizationMetrics(): Promise<OrgMetricsObject> {
    const [playerCount, userCount, activeUserCount] = await Promise.all([
      this.playerRepo.count(),
      this.userRepo.count(),
      this.userRepo.count({ where: { active: true } }),
    ]);

    return {
      playerCount,
      userCount,
      activeUserCount,
    };
  }
}
