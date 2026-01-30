import type {
  BallchasingPlayer,
  BallchasingResponse,
  BallchasingTeam,
  CarballResponse,
  CarballPlayer,
  CarballTeam,
} from '../celery/types/schemas/stats';
import { randomUUID } from 'crypto';

export class CarballConverterService {

  /**
   * Converts CarballResponse to BallchasingResponse format
   * This allows the rest of the codebase to work with a consistent format
   */
  convertToBallchasingFormat(
    carball: CarballResponse,
    outputPath: string,
  ): BallchasingResponse {

    // Extract metadata (supports both camelCase and snake_case)
    const metadata = carball.gameMetadata ?? carball.game_metadata ?? {};
    const gameStats = carball.gameStats ?? carball.game_stats ?? {};

    // Helper to validate and return a valid ISO date string
    const getValidDate = (dateValue: string | undefined): string => {
      if (!dateValue) return new Date().toISOString();
      const testDate = new Date(dateValue);
      return isNaN(testDate.getTime()) ? new Date().toISOString() : dateValue;
    };

    // Separate teams into blue and orange
    const teams = carball.teams ?? [];
    const players = carball.players ?? [];

    console.log(`[CarballConverter] Total players: ${players.length}`);
    console.log(`[CarballConverter] Total teams: ${teams.length}`);

    // Identify blue and orange teams based on player color
    // Carball returns isOrange (camelCase), not is_orange (snake_case)
    const bluePlayers = players.filter(p => {
      const isOrange = (p as any).isOrange ?? p.is_orange ?? 0;
      return isOrange === 0;
    });
    const orangePlayers = players.filter(p => {
      const isOrange = (p as any).isOrange ?? p.is_orange ?? 1;
      return isOrange === 1;
    });

    console.log(`[CarballConverter] Blue players: ${bluePlayers.length}, Orange players: ${orangePlayers.length}`);

    // Find team objects if they exist
    const blueTeam = teams.find(t => t.color === 0) ?? { players: bluePlayers };
    const orangeTeam = teams.find(t => t.color === 1) ?? { players: orangePlayers };

    // Calculate team scores from player data
    const blueScore = bluePlayers.reduce((sum, p) => sum + (p.score ?? 0), 0);
    const orangeScore = orangePlayers.reduce((sum, p) => sum + (p.score ?? 0), 0);

    // Generate stub ID from output path or random UUID
    const replayId = outputPath?.split('/').pop()?.replace('.replay', '') ?? randomUUID();

    // Convert to ballchasing format
    const ballchasingResponse: BallchasingResponse = {
      // Required fields - use stubs for ballchasing-specific fields
      id: replayId,
      link: `file://${outputPath}`,
      status: 'ok' as const,
      title: metadata.id ?? 'Carball Parsed Replay',
      date: getValidDate(metadata.time),
      date_has_timezone: false,
      created: new Date().toISOString(),
      visibility: 'private',

      // Rocket League metadata
      rocket_league_id: metadata.id ?? replayId,
      season: 0, // Unknown from carball
      match_guid: metadata.id ?? replayId,

      // Uploader - stub data
      recorder: undefined,
      uploader: {
        name: 'Carball Parser',
        avatar: '',
        steam_id: '0',
        profile_url: '',
      },

      // Match info
      match_type: metadata.match_type ?? metadata.playlist?.toString() ?? 'unknown',
      playlist_id: metadata.playlist?.toString() ?? 'unknown',
      playlist_name: this.getPlaylistName(metadata.playlist),

      // Map info
      map_code: metadata.map ?? 'unknown',
      map_name: metadata.map ?? 'UNKNOWN',

      // Duration (rounded to integer for database compatibility)
      duration: Math.round(metadata.length ?? 0),
      overtime: false, // TODO: Detect from carball data
      overtime_seconds: undefined,

      // Teams
      team_size: metadata.team_size ?? Math.max(bluePlayers.length, orangePlayers.length),
      blue: this.convertTeam(blueTeam, bluePlayers, 'blue'),
      orange: this.convertTeam(orangeTeam, orangePlayers, 'orange'),
    };

    return ballchasingResponse;
  }

  private convertTeam(
    team: CarballTeam | { players: CarballPlayer[] },
    players: CarballPlayer[],
    color: 'blue' | 'orange',
  ): BallchasingTeam {
    // Aggregate team stats from player stats
    const teamStats = this.aggregateTeamStats(players);

    return {
      name: (team as any).name,
      color,
      stats: teamStats,
      players: players.map(p => this.convertPlayer(p)),
    };
  }

  private convertPlayer(player: CarballPlayer): BallchasingPlayer {
    const playerId = player.id ?? { id: '0', platform: 'steam' };

    return {
      id: {
        id: (playerId as any).id ?? '0',
        platform: this.mapPlatform((playerId as any).platform),
      },
      name: player.name ?? 'Unknown',
      camera: this.extractCameraSettings(player.camera_settings),
      car_id: -1,
      car_name: 'UNKNOWN',
      start_time: player.first_frame_in_game ?? 0,
      end_time: (player.first_frame_in_game ?? 0) + (player.time_in_game ?? 0),
      steering_sensitivity: 1.0,
      stats: this.convertPlayerStats(player),
    };
  }

  private convertPlayerStats(player: CarballPlayer): any {
    // Extract stats from carball player stats object
    const stats = player.stats as any ?? {};

    return {
      core: {
        mvp: false,
        goals: player.goals ?? 0,
        saves: player.saves ?? 0,
        score: player.score ?? 0,
        shots: player.shots ?? 0,
        assists: player.assists ?? 0,
        goals_against: 0,
        shots_against: 0,
        shooting_percentage: 0,
      },
      demo: {
        taken: stats.demo_stats?.taken ?? 0,
        inflicted: stats.demo_stats?.inflicted ?? 0,
      },
      boost: this.extractBoostStats(stats.boost),
      movement: this.extractMovementStats(stats.distance, stats.speed),
      positioning: this.extractPositioningStats(stats.positional_tendencies, stats.relative_positioning),
    };
  }

  private aggregateTeamStats(players: CarballPlayer[]): any {
    // Aggregate player stats to team level
    const totalGoals = players.reduce((sum, p) => sum + (p.goals ?? 0), 0);
    const totalSaves = players.reduce((sum, p) => sum + (p.saves ?? 0), 0);
    const totalScore = players.reduce((sum, p) => sum + (p.score ?? 0), 0);
    const totalShots = players.reduce((sum, p) => sum + (p.shots ?? 0), 0);
    const totalAssists = players.reduce((sum, p) => sum + (p.assists ?? 0), 0);

    return {
      ball: {
        time_in_side: 0,
        possession_time: 0,
      },
      core: {
        goals: totalGoals,
        saves: totalSaves,
        score: totalScore,
        shots: totalShots,
        assists: totalAssists,
        goals_against: 0,
        shots_against: 0,
        shooting_percentage: totalShots > 0 ? (totalGoals / totalShots) * 100 : 0,
      },
      boost: this.getDefaultBoostStats(),
      movement: this.getDefaultMovementStats(),
      positioning: this.getDefaultPositioningStats(),
    };
  }

  private extractCameraSettings(cameraSettings: unknown): any {
    const settings = cameraSettings as any ?? {};
    return {
      fov: settings.fov ?? 110,
      pitch: settings.pitch ?? -3,
      height: settings.height ?? 100,
      distance: settings.distance ?? 270,
      stiffness: settings.stiffness ?? 0.5,
      swivel_speed: settings.swivel_speed ?? 3,
      transition_speed: settings.transition_speed ?? 1,
    };
  }

  private extractBoostStats(boostData: unknown): any {
    const boost = boostData as any ?? {};
    return {
      bpm: boost.bpm ?? 0,
      bcpm: boost.bcpm ?? 0,
      avg_amount: boost.avg_amount ?? boost.boost_usage ?? 0,
      amount_stolen: boost.amount_stolen ?? 0,
      amount_overfill: boost.amount_overfill ?? 0,
      time_boost_0_25: boost.time_boost_0_25 ?? 0,
      time_full_boost: boost.time_full_boost ?? 0,
      time_zero_boost: boost.time_zero_boost ?? 0,
      amount_collected: boost.amount_collected ?? boost.wasted_collection ?? 0,
      count_stolen_big: boost.count_stolen_big ?? 0,
      time_boost_25_50: boost.time_boost_25_50 ?? 0,
      time_boost_50_75: boost.time_boost_50_75 ?? 0,
      amount_stolen_big: boost.amount_stolen_big ?? 0,
      time_boost_75_100: boost.time_boost_75_100 ?? 0,
      count_stolen_small: boost.count_stolen_small ?? 0,
      percent_boost_0_25: 0,
      percent_full_boost: 0,
      percent_zero_boost: 0,
      amount_stolen_small: boost.amount_stolen_small ?? 0,
      count_collected_big: boost.count_collected_big ?? 0,
      percent_boost_25_50: 0,
      percent_boost_50_75: 0,
      amount_collected_big: boost.amount_collected_big ?? 0,
      percent_boost_75_100: 0,
      count_collected_small: boost.count_collected_small ?? 0,
      amount_collected_small: boost.amount_collected_small ?? 0,
      amount_overfill_stolen: boost.amount_overfill_stolen ?? 0,
      amount_used_while_supersonic: boost.amount_used_while_supersonic ?? 0,
    };
  }

  private extractMovementStats(distanceData: unknown, speedData: unknown): any {
    const distance = distanceData as any ?? {};
    const speed = speedData as any ?? {};

    return {
      avg_speed: speed.avg_speed ?? 0,
      time_ground: distance.time_on_ground ?? 0,
      time_low_air: distance.time_low_in_air ?? 0,
      time_high_air: distance.time_high_in_air ?? 0,
      percent_ground: 0,
      total_distance: distance.ball_hit_forward ?? 0,
      percent_low_air: 0,
      time_powerslide: distance.time_powerslide ?? 0,
      time_slow_speed: speed.time_at_slow_speed ?? 0,
      count_powerslide: distance.count_powerslide ?? 0,
      percent_high_air: 0,
      time_boost_speed: speed.time_at_boost_speed ?? 0,
      percent_slow_speed: 0,
      percent_boost_speed: 0,
      avg_speed_percentage: 0,
      time_supersonic_speed: speed.time_at_super_sonic ?? 0,
      avg_powerslide_duration: 0,
      percent_supersonic_speed: 0,
    };
  }

  private extractPositioningStats(positionalTendencies: unknown, relativePositioning: unknown): any {
    const positioning = positionalTendencies as any ?? {};
    const relative = relativePositioning as any ?? {};

    return {
      time_most_back: positioning.time_most_back ?? 0,
      time_behind_ball: positioning.time_behind_ball ?? 0,
      percent_most_back: 0,
      time_infront_ball: positioning.time_infront_ball ?? 0,
      time_most_forward: positioning.time_most_forward ?? 0,
      time_neutral_third: positioning.time_neutral_third ?? 0,
      percent_behind_ball: 0,
      time_defensive_half: positioning.time_defensive_half ?? 0,
      time_offensive_half: positioning.time_offensive_half ?? 0,
      avg_distance_to_ball: relative.avg_distance_to_ball ?? 0,
      percent_infront_ball: 0,
      percent_most_forward: 0,
      time_closest_to_ball: positioning.time_closest_to_ball ?? 0,
      time_defensive_third: positioning.time_defensive_third ?? 0,
      time_offensive_third: positioning.time_offensive_third ?? 0,
      avg_distance_to_mates: relative.avg_distance_to_mates ?? 0,
      percent_neutral_third: 0,
      percent_defensive_half: 0,
      percent_offensive_half: 0,
      percent_closest_to_ball: 0,
      percent_defensive_third: 0,
      percent_offensive_third: 0,
      time_farthest_from_ball: positioning.time_farthest_from_ball ?? 0,
      percent_farthest_from_ball: 0,
      avg_distance_to_ball_possession: 0,
      goals_against_while_last_defender: 0,
      avg_distance_to_ball_no_possession: 0,
    };
  }

  private getDefaultBoostStats(): any {
    return {
      bpm: 0,
      bcpm: 0,
      avg_amount: 0,
      amount_stolen: 0,
      amount_overfill: 0,
      time_boost_0_25: 0,
      time_full_boost: 0,
      time_zero_boost: 0,
      amount_collected: 0,
      count_stolen_big: 0,
      time_boost_25_50: 0,
      time_boost_50_75: 0,
      amount_stolen_big: 0,
      time_boost_75_100: 0,
      count_stolen_small: 0,
      amount_stolen_small: 0,
      count_collected_big: 0,
      amount_collected_big: 0,
      count_collected_small: 0,
      amount_collected_small: 0,
      amount_overfill_stolen: 0,
      amount_used_while_supersonic: 0,
    };
  }

  private getDefaultMovementStats(): any {
    return {
      time_ground: 0,
      time_low_air: 0,
      time_high_air: 0,
      total_distance: 0,
      time_powerslide: 0,
      time_slow_speed: 0,
      count_powerslide: 0,
      time_boost_speed: 0,
      time_supersonic_speed: 0,
    };
  }

  private getDefaultPositioningStats(): any {
    return {
      time_behind_ball: 0,
      time_infront_ball: 0,
      time_neutral_third: 0,
      time_defensive_half: 0,
      time_offensive_half: 0,
      time_defensive_third: 0,
      time_offensive_third: 0,
    };
  }

  private mapPlatform(platform: string | undefined): 'steam' | 'xbox' | 'ps4' | 'epic' {
    const platformLower = (platform ?? 'steam').toLowerCase();
    if (platformLower.includes('xbox') || platformLower === 'xboxone') return 'xbox';
    if (platformLower.includes('ps') || platformLower === 'ps4' || platformLower === 'playstation')
      return 'ps4';
    if (platformLower.includes('epic')) return 'epic';
    return 'steam';
  }

  private getPlaylistName(playlist: number | undefined): string {
    const playlistMap: Record<number, string> = {
      1: 'Duel',
      2: 'Doubles',
      3: 'Standard',
      4: 'Chaos',
      6: 'Rocket Labs',
      10: 'Ranked Duel',
      11: 'Ranked Doubles',
      13: 'Ranked Standard',
      27: 'Hoops',
      28: 'Rumble',
      29: 'Dropshot',
      30: 'Snow Day',
    };

    return playlistMap[playlist ?? 0] ?? 'Unknown';
  }
}
