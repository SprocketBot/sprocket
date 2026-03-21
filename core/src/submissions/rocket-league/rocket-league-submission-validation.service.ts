import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  FixtureEntity,
  GameModeEntity,
  MatchEntity,
  MatchSubmissionEntity,
  PlayerEntity,
  ReplaySubmissionItemEntity,
  ReplaySubmissionItemStatus,
  ReplaySubmissionType,
  ScrimEntity,
  UserAuthAccountEntity,
} from '../../db/internal';
import { MinioService } from '../../storage/minio.service';
import {
  SubmissionValidationError,
  SubmissionValidationResult,
} from '../replay-submission.types';

type BallchasingTeam = {
  players: Array<{
    name: string;
    id: { platform: string; id: string };
  }>;
};

type BallchasingResponse = {
  blue: BallchasingTeam;
  orange: BallchasingTeam;
};

@Injectable()
export class RocketLeagueSubmissionValidationService {
  private readonly logger = new Logger(
    RocketLeagueSubmissionValidationService.name,
  );

  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepo: Repository<MatchEntity>,
    @InjectRepository(FixtureEntity)
    private readonly fixtureRepo: Repository<FixtureEntity>,
    @InjectRepository(ScrimEntity)
    private readonly scrimRepo: Repository<ScrimEntity>,
    @InjectRepository(GameModeEntity)
    private readonly gameModeRepo: Repository<GameModeEntity>,
    @InjectRepository(UserAuthAccountEntity)
    private readonly accountRepo: Repository<UserAuthAccountEntity>,
    @InjectRepository(PlayerEntity)
    private readonly playerRepo: Repository<PlayerEntity>,
    private readonly minio: MinioService,
  ) {}

  async validateSubmission(
    submission: MatchSubmissionEntity,
  ): Promise<SubmissionValidationResult> {
    if (submission.submissionType === ReplaySubmissionType.SCRIM) {
      return this.validateScrimSubmission(submission);
    }
    if (submission.submissionType === ReplaySubmissionType.LFS) {
      return this.validateLfsSubmission(submission);
    }
    return this.validateMatchSubmission(submission);
  }

  private async validateLfsSubmission(
    submission: MatchSubmissionEntity,
  ): Promise<SubmissionValidationResult> {
    const scrim = await this.getScrimForSubmission(submission);
    if (!scrim) {
      return { valid: false, errors: [{ error: 'Scrim not found' }] };
    }

    const itemErrors = this.getItemErrors(submission.items);
    if (itemErrors.length) return { valid: false, errors: itemErrors };

    const expectedGameCount =
      submission.submittedData?.expectedGameCount ??
      scrim.settings?.gameCount ??
      scrim.settings?.games?.length;
    if (expectedGameCount && submission.items?.length !== expectedGameCount) {
      return {
        valid: false,
        errors: [
          {
            error: `Incorrect number of replays submitted, expected ${expectedGameCount} but found ${submission.items?.length ?? 0}`,
          },
        ],
      };
    }

    const stats = await this.getStatsForItems(submission.items);
    if (!stats.length) {
      return {
        valid: false,
        errors: [{ error: 'The submission is missing stats.' }],
      };
    }

    const gameMode = await this.getGameMode(scrim.gameMode?.id);
    if (!gameMode) {
      return {
        valid: false,
        errors: [{ error: 'Failed to find associated game mode.' }],
      };
    }

    const requiredUniquePlayers = gameMode.playerCount;
    const players = await this.resolvePlayersFromStats(stats, scrim.game?.id);
    if (!players.valid || !players.data) return players;

    const uniquePlayers = Array.from(
      new Set(players.data.map((p) => p.player.id)),
    );
    if (uniquePlayers.length !== requiredUniquePlayers) {
      return {
        valid: false,
        errors: [
          {
            error: `An incorrect number of unique players played in this game. Required: ${requiredUniquePlayers} Found: ${uniquePlayers.length}`,
          },
        ],
      };
    }

    if (scrim.settings?.competitive) {
      const invalid = players.data.find(
        (p) => p.player.skillGroup?.id !== scrim.skillGroup?.id,
      );
      if (invalid) {
        return {
          valid: false,
          errors: [
            { error: "One of the players isn't in the correct skill group" },
          ],
        };
      }
    }

    return { valid: true, errors: [] };
  }

  private async validateScrimSubmission(
    submission: MatchSubmissionEntity,
  ): Promise<SubmissionValidationResult> {
    const scrim = await this.getScrimForSubmission(submission);
    if (!scrim) {
      return { valid: false, errors: [{ error: 'Scrim not found' }] };
    }

    const itemErrors = this.getItemErrors(submission.items);
    if (itemErrors.length) return { valid: false, errors: itemErrors };

    const expectedGameCount =
      submission.submittedData?.expectedGameCount ??
      scrim.settings?.gameCount ??
      scrim.settings?.games?.length;
    if (expectedGameCount && submission.items?.length !== expectedGameCount) {
      return {
        valid: false,
        errors: [
          {
            error: `Incorrect number of replays submitted, expected ${expectedGameCount} but found ${submission.items?.length ?? 0}`,
          },
        ],
      };
    }

    const stats = await this.getStatsForItems(submission.items);
    if (!stats.length) {
      return {
        valid: false,
        errors: [{ error: 'The submission is missing stats.' }],
      };
    }

    const players = await this.resolvePlayersFromStats(stats, scrim.game?.id);
    if (!players.valid || !players.data) return players;

    if (scrim.settings?.competitive) {
      const invalid = players.data.find(
        (p) => p.player.skillGroup?.id !== scrim.skillGroup?.id,
      );
      if (invalid) {
        return {
          valid: false,
          errors: [
            { error: "One of the players isn't in the correct skill group" },
          ],
        };
      }
    }

    if (scrim.players?.length) {
      const allowed = new Set(scrim.players.map((p) => p.user?.id));
      const offender = players.data.find((p) => !allowed.has(p.user.id));
      if (offender) {
        return {
          valid: false,
          errors: [{ error: 'One or more players are not in the scrim.' }],
        };
      }
    }

    return { valid: true, errors: [] };
  }

  private async validateMatchSubmission(
    submission: MatchSubmissionEntity,
  ): Promise<SubmissionValidationResult> {
    const errors: SubmissionValidationError[] = [];

    const itemErrors = this.getItemErrors(submission.items);
    if (itemErrors.length) return { valid: false, errors: itemErrors };

    const stats = await this.getStatsForItems(submission.items);
    if (!stats.length) {
      return {
        valid: false,
        errors: [{ error: 'The submission is missing stats.' }],
      };
    }

    const match = await this.getMatchForSubmission(submission);
    if (!match) {
      return { valid: false, errors: [{ error: 'Match not found' }] };
    }

    const fixture = await this.fixtureRepo.findOne({
      where: { id: match.id },
      relations: ['homeFranchise', 'awayFranchise'],
    });

    const players = await this.resolvePlayersFromStats(stats, match.game?.id);
    if (!players.valid || !players.data) return players;

    for (const item of submission.items) {
      const data = await this.getStats(item.outputPath!);
      const bluePlayers = this.mapTeamPlayers(
        data.blue,
        players.data,
        item.originalFilename,
        errors,
      );
      const orangePlayers = this.mapTeamPlayers(
        data.orange,
        players.data,
        item.originalFilename,
        errors,
      );

      if (!bluePlayers.length || !orangePlayers.length) continue;

      const blueFranchise = this.getFranchiseName(bluePlayers);
      const orangeFranchise = this.getFranchiseName(orangePlayers);

      if (blueFranchise && orangeFranchise && blueFranchise === orangeFranchise) {
        errors.push({
          error: `Players from a single franchise found on both teams in replay ${item.originalFilename}`,
        });
      }

      if (!this.isSingleFranchise(bluePlayers)) {
        errors.push({
          error: `Multiple franchises found for blue team in replay ${item.originalFilename}`,
        });
      }
      if (!this.isSingleFranchise(orangePlayers)) {
        errors.push({
          error: `Multiple franchises found for orange team in replay ${item.originalFilename}`,
        });
      }

      if (fixture?.homeFranchise && fixture?.awayFranchise) {
        const homeName = fixture.homeFranchise.name;
        const awayName = fixture.awayFranchise.name;
        if (![blueFranchise, orangeFranchise].includes(homeName)) {
          errors.push({
            error: `Home team ${homeName} not found in replay ${item.originalFilename}. (Found ${blueFranchise} and ${orangeFranchise})`,
          });
        }
        if (![blueFranchise, orangeFranchise].includes(awayName)) {
          errors.push({
            error: `Away team ${awayName} not found in replay ${item.originalFilename}. (Found ${blueFranchise} and ${orangeFranchise})`,
          });
        }
      }
    }

    const gameMode = await this.getGameMode(match.gameMode?.id);
    if (!gameMode) {
      return {
        valid: false,
        errors: [{ error: 'Failed to find associated game mode.' }],
      };
    }

    const teamSize = gameMode.teamSize;
    const minimumUniquePlayers = teamSize;
    const uniquePlayersLimit = teamSize + 1;
    const perFilePlayerLimit = teamSize + 1;

    errors.push(
      ...this.validateTeams(
        uniquePlayersLimit,
        perFilePlayerLimit,
        minimumUniquePlayers,
        submission.items,
        stats,
      ),
    );

    const expectedSkillGroupId = submission.submittedData?.skillGroupId;
    if (expectedSkillGroupId) {
      const invalid = players.data.find(
        (p) => p.player.skillGroup?.id !== expectedSkillGroupId,
      );
      if (invalid) {
        errors.push({
          error: `Player(s) from incorrect skill group found in replay submission`,
        });
      }
    }

    if (errors.length) {
      return { valid: false, errors };
    }
    return { valid: true, errors: [] };
  }

  private getItemErrors(
    items: ReplaySubmissionItemEntity[] | undefined,
  ): SubmissionValidationError[] {
    const errors: SubmissionValidationError[] = [];
    for (const item of items ?? []) {
      if (item.status === ReplaySubmissionItemStatus.ERROR) {
        errors.push({
          error: `Error encountered while parsing file ${item.originalFilename}`,
        });
      }
      if (!item.outputPath) {
        errors.push({
          error: `Replay item missing output data: ${item.originalFilename}`,
        });
      }
    }
    return errors;
  }

  private async getStatsForItems(
    items: ReplaySubmissionItemEntity[] | undefined,
  ): Promise<BallchasingResponse[]> {
    if (!items?.length) return [];
    return Promise.all(items.map((item) => this.getStats(item.outputPath!)));
  }

  private async getStats(outputPath: string): Promise<BallchasingResponse> {
    const raw = await this.minio.getObject(outputPath);
    const parsed = JSON.parse(raw.toString('utf-8'));
    if (parsed.parser) {
      return parsed.data as BallchasingResponse;
    }
    return parsed.data as BallchasingResponse;
  }

  private async resolvePlayersFromStats(
    stats: BallchasingResponse[],
    gameId?: string,
  ): Promise<
    SubmissionValidationResult & {
      data?: Array<{
        user: any;
        player: PlayerEntity;
        account: UserAuthAccountEntity;
      }>;
    }
  > {
    const uniqueBallchasingPlayerIds = Array.from(
      new Set(
        stats.flatMap((s) =>
          [s.blue, s.orange].flatMap((t) =>
            t.players.map((p) => ({
              name: p.name,
              platform: p.id.platform.toUpperCase(),
              id: p.id.id,
            })),
          ),
        ),
      ),
    );

    const accounts = await this.accountRepo.find({
      where: uniqueBallchasingPlayerIds.map((p) => ({
        platform: p.platform,
        platformId: p.id,
      })),
      relations: ['user'],
    });

    const missing = uniqueBallchasingPlayerIds.filter(
      (p) =>
        !accounts.find(
          (a) => a.platform === p.platform && a.platformId === p.id,
        ),
    );
    if (missing.length) {
      const names = missing.map((m) => m.name).join(', ');
      return {
        valid: false,
        errors: [
          {
            error: `One or more players played on an unreported account: ${names}. RawData: ${JSON.stringify(
              { unreported: missing },
            )}`,
            code: 'UNREPORTED_ACCOUNTS',
          },
        ],
      };
    }

    const playerData: Array<{
      user: any;
      player: PlayerEntity;
      account: UserAuthAccountEntity;
    }> = [];
    const missingPlayers: Array<{ platform: string; platformId: string }> = [];

    for (const account of accounts) {
      const player = await this.playerRepo.findOne({
        where: {
          user: { id: account.userId },
          game: gameId ? ({ id: gameId } as any) : undefined,
        },
        relations: [
          'user',
          'skillGroup',
          'rosterSpots',
          'rosterSpots.team',
          'rosterSpots.team.club',
          'rosterSpots.team.club.franchise',
        ],
      });
      if (player) {
        playerData.push({
          user: account.user,
          player,
          account,
        });
      } else {
        missingPlayers.push({
          platform: account.platform,
          platformId: account.platformId,
        });
      }
    }

    if (missingPlayers.length) {
      return {
        valid: false,
        errors: [
          {
            error: `One or more players are not registered for this game: ${missingPlayers
              .map((p) => `${p.platform}:${p.platformId}`)
              .join(', ')}`,
          },
        ],
      };
    }

    return {
      valid: true,
      errors: [],
      data: playerData,
    };
  }

  private mapTeamPlayers(
    team: BallchasingTeam,
    players: Array<{ player: PlayerEntity; account: UserAuthAccountEntity }>,
    filename: string,
    errors: SubmissionValidationError[],
  ): PlayerEntity[] {
    const mapped: PlayerEntity[] = [];
    for (const p of team.players) {
      const found = players.find(
        (pl) =>
          pl.account.platform === p.id.platform.toUpperCase() &&
          pl.account.platformId === p.id.id,
      );
      if (!found) {
        errors.push({
          error: `Error looking up match participants in replay ${filename}`,
        });
        continue;
      }
      mapped.push(found.player);
    }
    return mapped;
  }

  private getFranchiseName(players: PlayerEntity[]): string | undefined {
    const franchise = players
      .flatMap((p) => p.rosterSpots ?? [])
      .map((rs) => rs.team?.club?.franchise?.name)
      .find((name) => Boolean(name));
    return franchise;
  }

  private isSingleFranchise(players: PlayerEntity[]): boolean {
    const franchises = new Set(
      players
        .flatMap((p) => p.rosterSpots ?? [])
        .map((rs) => rs.team?.club?.franchise?.id)
        .filter(Boolean),
    );
    return franchises.size <= 1;
  }

  private validateTeams(
    uniquePlayersLimit: number,
    perFilePlayerLimit: number,
    minimumUniquePlayers: number,
    items: ReplaySubmissionItemEntity[] | undefined,
    stats: BallchasingResponse[],
  ): SubmissionValidationError[] {
    const errors: SubmissionValidationError[] = [];
    const uniquePlayersPerTeam: Record<string, Set<string>> = {
      blue: new Set(),
      orange: new Set(),
    };
    const substitutionCount: Record<string, number> = {
      blue: 0,
      orange: 0,
    };
    const maxSubstitutions = 1;

    items?.forEach((item, idx) => {
      const data = stats[idx];
      const bluePlayers = data.blue.players.map((p) => p.id.id);
      const orangePlayers = data.orange.players.map((p) => p.id.id);

      if (bluePlayers.length > perFilePlayerLimit) {
        errors.push({
          error: `Too many players on blue team in replay ${item.originalFilename}`,
        });
      } else if (bluePlayers.length < minimumUniquePlayers) {
        errors.push({
          error: `Not enough players on blue team in replay ${item.originalFilename}`,
        });
      }
      if (orangePlayers.length > perFilePlayerLimit) {
        errors.push({
          error: `Too many players on orange team in replay ${item.originalFilename}`,
        });
      } else if (orangePlayers.length < minimumUniquePlayers) {
        errors.push({
          error: `Not enough players on orange team in replay ${item.originalFilename}`,
        });
      }

      if (bluePlayers.length > perFilePlayerLimit - 1) {
        substitutionCount.blue++;
      }
      if (orangePlayers.length > perFilePlayerLimit - 1) {
        substitutionCount.orange++;
      }

      bluePlayers.forEach((p) => uniquePlayersPerTeam.blue.add(p));
      orangePlayers.forEach((p) => uniquePlayersPerTeam.orange.add(p));
    });

    for (const [team, playersSet] of Object.entries(uniquePlayersPerTeam)) {
      if (playersSet.size > uniquePlayersLimit) {
        errors.push({
          error: `Too many unique players on ${team} team across replays`,
        });
      }
    }

    for (const [team, count] of Object.entries(substitutionCount)) {
      if (count > maxSubstitutions) {
        errors.push({
          error: `Illegal substitution, more than one substitution in the same match for team ${team}.`,
        });
      }
    }

    return errors;
  }

  private async getScrimForSubmission(
    submission: MatchSubmissionEntity,
  ): Promise<ScrimEntity | null> {
    if (submission.scrim) return submission.scrim;
    if (submission.submittedData?.scrimId) {
      return this.scrimRepo.findOne({
        where: { id: submission.submittedData.scrimId },
        relations: ['players', 'players.user', 'skillGroup', 'gameMode', 'game'],
      });
    }
    return null;
  }

  private async getMatchForSubmission(
    submission: MatchSubmissionEntity,
  ): Promise<MatchEntity | null> {
    if (submission.match) return submission.match;
    if (submission.submittedData?.matchId) {
      return this.matchRepo.findOne({
        where: { id: submission.submittedData.matchId },
        relations: ['game', 'gameMode', 'rounds'],
      });
    }
    return null;
  }

  private async getGameMode(id?: string): Promise<GameModeEntity | null> {
    if (!id) return null;
    return this.gameModeRepo.findOne({ where: { id } });
  }
}
