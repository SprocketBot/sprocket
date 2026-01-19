import type { BallchasingPlayer } from '@sprocketbot/common';

import type { MLE_PlayerStats, MLE_PlayerStatsCore } from '../../database/mledb';
const platformLookup: Map<string, string> = new Map([
  ['XBox', 'XBOX'],
  ['PS4', 'PS4'],
  ['steam', 'STEAM'],
  ['epic', 'EPIC'],
]);

export function assignPlayerStats(
  stats: MLE_PlayerStats,
  ballchasing: BallchasingPlayer,
  coreStats: MLE_PlayerStatsCore,
): MLE_PlayerStats {
  stats.startTime = ballchasing.start_time;
  stats.endTime = ballchasing.end_time;

  stats.carName = ballchasing.car_name;
  stats.carId = ballchasing.car_id;
  stats.steeringSensitivity = ballchasing.steering_sensitivity;
  stats.playerPlatform = platformLookup.get(ballchasing.id.platform) ?? 'UNKNOWN';
  stats.cameraFov = ballchasing.camera.fov;
  stats.cameraHeight = ballchasing.camera.height;
  stats.cameraPitch = ballchasing.camera.pitch;
  stats.cameraDistance = ballchasing.camera.distance;
  stats.cameraStiffness = ballchasing.camera.stiffness;
  stats.cameraSwivelSpeed = ballchasing.camera.swivel_speed;
  stats.cameraTransitionSpeed = ballchasing.camera.transition_speed;
  stats.coreStats = coreStats;
  // boost stats
  stats.boostPerMinute = ballchasing.stats.boost.bpm;
  stats.boostCollectedPerMinute = ballchasing.stats.boost.bcpm;
  stats.boostAverage = ballchasing.stats.boost.avg_amount;
  stats.boostCollected = ballchasing.stats.boost.amount_collected;
  stats.boostStolen = ballchasing.stats.boost.amount_stolen;
  stats.boostCollectedBig = ballchasing.stats.boost.amount_collected_big;
  stats.boostStolenBig = ballchasing.stats.boost.amount_stolen_big;
  stats.boostCollectedSmall = ballchasing.stats.boost.amount_collected_small;
  stats.boostStolenSmall = ballchasing.stats.boost.amount_stolen_small;
  stats.boostCountCollectedBig = ballchasing.stats.boost.count_collected_big;
  stats.boostCountStolenBig = ballchasing.stats.boost.count_stolen_big;
  stats.boostCountCollectedSmall = ballchasing.stats.boost.count_collected_small;
  stats.boostCountStolenSmall = ballchasing.stats.boost.count_stolen_small;
  stats.boostOverfill = ballchasing.stats.boost.amount_overfill;
  stats.boostOverfillStolen = ballchasing.stats.boost.amount_overfill_stolen;
  stats.boostWasted = ballchasing.stats.boost.amount_used_while_supersonic;
  stats.boostTimeEmpty = ballchasing.stats.boost.time_zero_boost;
  stats.boostPercentEmpty = ballchasing.stats.boost.percent_zero_boost;
  stats.boostTimeFull = ballchasing.stats.boost.time_full_boost;
  stats.boostPercentFull = ballchasing.stats.boost.percent_full_boost;
  stats.boostTime0to25 = ballchasing.stats.boost.time_boost_0_25;
  stats.boostTime25to50 = ballchasing.stats.boost.time_boost_25_50;
  stats.boostTime50to75 = ballchasing.stats.boost.time_boost_50_75;
  stats.boostTime75to100 = ballchasing.stats.boost.time_boost_75_100;
  stats.boostPercent0to25 = ballchasing.stats.boost.percent_boost_0_25;
  stats.boostPercent25to50 = ballchasing.stats.boost.percent_boost_25_50;
  stats.boostPercent50to75 = ballchasing.stats.boost.percent_boost_50_75;
  stats.boostPercent75to100 = ballchasing.stats.boost.percent_boost_75_100;
  // positioning stats
  stats.avgDistanceToBall = ballchasing.stats.positioning.avg_distance_to_ball;
  stats.avgDistanceToBallPossession = ballchasing.stats.positioning.avg_distance_to_ball_possession;
  stats.avgDistanceToBallNoPossession =
    ballchasing.stats.positioning.avg_distance_to_ball_no_possession;
  stats.avgDistanceToMates = ballchasing.stats.positioning.avg_distance_to_mates;
  stats.timeDefensiveThird = ballchasing.stats.positioning.time_defensive_third;
  stats.timeNeutralThird = ballchasing.stats.positioning.time_neutral_third;
  stats.timeOffensiveThird = ballchasing.stats.positioning.time_offensive_third;
  stats.timeDefensiveHalf = ballchasing.stats.positioning.time_defensive_half;
  stats.timeOffensiveHalf = ballchasing.stats.positioning.time_offensive_half;
  stats.timeBehindBall = ballchasing.stats.positioning.time_behind_ball;
  stats.timeInfrontBall = ballchasing.stats.positioning.time_infront_ball;
  stats.timeMostBack = ballchasing.stats.positioning.time_most_back;
  stats.timeMostForward = ballchasing.stats.positioning.time_most_forward;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  stats.goalsAgainstWhileLastDefender =
    ballchasing.stats.positioning.goals_against_while_last_defender ?? 0;
  stats.timeClosestToBall = ballchasing.stats.positioning.time_closest_to_ball;
  stats.timeFarthestFromBall = ballchasing.stats.positioning.time_farthest_from_ball;
  stats.percentDefensiveThird = ballchasing.stats.positioning.percent_defensive_third;
  stats.percentOffensiveThird = ballchasing.stats.positioning.percent_offensive_third;
  stats.percentNeutralThird = ballchasing.stats.positioning.percent_neutral_third;
  stats.percentDefensiveHalf = ballchasing.stats.positioning.percent_defensive_half;
  stats.percentOffensiveHalf = ballchasing.stats.positioning.percent_offensive_half;
  stats.percentBehindBall = ballchasing.stats.positioning.percent_behind_ball;
  stats.percentInfrontBall = ballchasing.stats.positioning.percent_infront_ball;
  stats.percentMostBack = ballchasing.stats.positioning.percent_most_back;
  stats.percentMostForward = ballchasing.stats.positioning.percent_most_forward;
  stats.percentClosestToBall = ballchasing.stats.positioning.percent_closest_to_ball;
  stats.percentFarthestFromBall = ballchasing.stats.positioning.percent_farthest_from_ball;
  // demo stats
  stats.demosInflicted = ballchasing.stats.demo.inflicted;
  stats.demosTaken = ballchasing.stats.demo.taken;
  // movement stats
  stats.avgSpeed = ballchasing.stats.movement.avg_speed;
  stats.totalDistance = ballchasing.stats.movement.total_distance;
  stats.timeSupersonicSpeed = ballchasing.stats.movement.time_supersonic_speed;
  stats.timeBoostSpeed = ballchasing.stats.movement.time_boost_speed;
  stats.timeSlowSpeed = ballchasing.stats.movement.time_slow_speed;
  stats.timeGround = ballchasing.stats.movement.time_ground;
  stats.timeLowAir = ballchasing.stats.movement.time_low_air;
  stats.timeHighAir = ballchasing.stats.movement.time_high_air;
  stats.timePowerslide = ballchasing.stats.movement.time_powerslide;
  stats.countPowerslide = ballchasing.stats.movement.count_powerslide;
  stats.avgPowerslideDuration = ballchasing.stats.movement.avg_powerslide_duration;
  stats.avgSpeedPercentage = ballchasing.stats.movement.avg_speed_percentage;
  stats.percentSlowSpeed = ballchasing.stats.movement.percent_slow_speed;
  stats.percentBoostSpeed = ballchasing.stats.movement.percent_boost_speed;
  stats.percentSupersonicSpeed = ballchasing.stats.movement.percent_supersonic_speed;
  stats.percentGround = ballchasing.stats.movement.percent_ground;
  stats.percentLowAir = ballchasing.stats.movement.percent_low_air;
  stats.percentHighAir = ballchasing.stats.movement.percent_high_air;

  return stats;
}
