import {
    Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn,
} from "typeorm";

import {MLE_Player} from "./Player.model";
import {MLE_PlayerStatsCore} from "./PlayerStatsCore.model";
import {MLE_SeriesReplay} from "./SeriesReplay.model";

@Index("player_stats_core_stats_id_unique", ["coreStatsId"], {unique: true})
@Index("player_stats_pkey", ["id"], {unique: true})
@Entity("player_stats", {schema: "mledb"})
export class MLE_PlayerStats {
    @PrimaryGeneratedColumn({type: "integer", name: "id"})
    id: number;

    @Column("character varying", {
        name: "created_by",
        length: 255,
        default: () => "'Unknown'",
    })
    createdBy: string;

    @Column("timestamp without time zone", {
        name: "created_at",
        default: () => "now()",
    })
    createdAt: Date;

    @Column("character varying", {
        name: "updated_by",
        length: 255,
        default: () => "'Unknown'",
    })
    updatedBy: string;

    @Column("timestamp without time zone", {
        name: "updated_at",
        default: () => "now()",
    })
    updatedAt: Date;

    @Column("integer", {name: "start_time"})
    startTime: number;

    @Column("integer", {name: "end_time"})
    endTime: number;

    @Column("character varying", {name: "car_name", length: 255})
    carName: string;

    @Column("integer", {name: "car_id"})
    carId: number;

    @Column("integer", {name: "steering_sensitivity"})
    steeringSensitivity: number;

    @Column("character varying", {name: "player_platform", length: 255})
    playerPlatform: string;

    @Column("integer", {name: "camera_fov"})
    cameraFov: number;

    @Column("integer", {name: "camera_height"})
    cameraHeight: number;

    @Column("integer", {name: "camera_pitch"})
    cameraPitch: number;

    @Column("integer", {name: "camera_distance"})
    cameraDistance: number;

    @Column("integer", {name: "camera_stiffness"})
    cameraStiffness: number;

    @Column("integer", {name: "camera_swivel_speed"})
    cameraSwivelSpeed: number;

    @Column("integer", {name: "camera_transition_speed"})
    cameraTransitionSpeed: number;

    @Column("integer", {name: "core_stats_id", unique: true})
    coreStatsId: number;

    @Column("integer", {name: "boost_per_minute"})
    boostPerMinute: number;

    @Column("integer", {name: "boost_collected_per_minute"})
    boostCollectedPerMinute: number;

    @Column("integer", {name: "boost_average"})
    boostAverage: number;

    @Column("integer", {name: "boost_collected"})
    boostCollected: number;

    @Column("integer", {name: "boost_stolen"})
    boostStolen: number;

    @Column("integer", {name: "boost_collected_big"})
    boostCollectedBig: number;

    @Column("integer", {name: "boost_stolen_big"})
    boostStolenBig: number;

    @Column("integer", {name: "boost_collected_small"})
    boostCollectedSmall: number;

    @Column("integer", {name: "boost_stolen_small"})
    boostStolenSmall: number;

    @Column("integer", {name: "boost_count_collected_big"})
    boostCountCollectedBig: number;

    @Column("integer", {name: "boost_count_stolen_big"})
    boostCountStolenBig: number;

    @Column("integer", {name: "boost_count_collected_small"})
    boostCountCollectedSmall: number;

    @Column("integer", {name: "boost_count_stolen_small"})
    boostCountStolenSmall: number;

    @Column("integer", {name: "boost_overfill"})
    boostOverfill: number;

    @Column("integer", {name: "boost_overfill_stolen"})
    boostOverfillStolen: number;

    @Column("integer", {name: "boost_wasted"})
    boostWasted: number;

    @Column("integer", {name: "boost_time_empty"})
    boostTimeEmpty: number;

    @Column("integer", {name: "boost_percent_empty"})
    boostPercentEmpty: number;

    @Column("integer", {name: "boost_time_full"})
    boostTimeFull: number;

    @Column("integer", {name: "boost_percent_full"})
    boostPercentFull: number;

    @Column("integer", {name: "boost_time0to25"})
    boostTime0to25: number;

    @Column("integer", {name: "boost_time25to50"})
    boostTime25to50: number;

    @Column("integer", {name: "boost_time50to75"})
    boostTime50to75: number;

    @Column("integer", {name: "boost_time75to100"})
    boostTime75to100: number;

    @Column("integer", {name: "boost_percent0to25"})
    boostPercent0to25: number;

    @Column("integer", {name: "boost_percent25to50"})
    boostPercent25to50: number;

    @Column("integer", {name: "boost_percent50to75"})
    boostPercent50to75: number;

    @Column("integer", {name: "boost_percent75to100"})
    boostPercent75to100: number;

    @Column("integer", {name: "avg_distance_to_ball"})
    avgDistanceToBall: number;

    @Column("integer", {name: "avg_distance_to_ball_possession"})
    avgDistanceToBallPossession: number;

    @Column("integer", {name: "avg_distance_to_ball_no_possession"})
    avgDistanceToBallNoPossession: number;

    @Column("integer", {name: "avg_distance_to_mates"})
    avgDistanceToMates: number;

    @Column("integer", {name: "time_defensive_third"})
    timeDefensiveThird: number;

    @Column("integer", {name: "time_neutral_third"})
    timeNeutralThird: number;

    @Column("integer", {name: "time_offensive_third"})
    timeOffensiveThird: number;

    @Column("integer", {name: "time_defensive_half"})
    timeDefensiveHalf: number;

    @Column("integer", {name: "time_offensive_half"})
    timeOffensiveHalf: number;

    @Column("integer", {name: "time_behind_ball"})
    timeBehindBall: number;

    @Column("integer", {name: "time_infront_ball"})
    timeInfrontBall: number;

    @Column("integer", {name: "time_most_back"})
    timeMostBack: number;

    @Column("integer", {name: "time_most_forward"})
    timeMostForward: number;

    @Column("integer", {name: "goals_against_while_last_defender"})
    goalsAgainstWhileLastDefender: number;

    @Column("integer", {name: "time_closest_to_ball"})
    timeClosestToBall: number;

    @Column("integer", {name: "time_farthest_from_ball"})
    timeFarthestFromBall: number;

    @Column("integer", {name: "percent_defensive_third"})
    percentDefensiveThird: number;

    @Column("integer", {name: "percent_offensive_third"})
    percentOffensiveThird: number;

    @Column("integer", {name: "percent_neutral_third"})
    percentNeutralThird: number;

    @Column("integer", {name: "percent_defensive_half"})
    percentDefensiveHalf: number;

    @Column("integer", {name: "percent_offensive_half"})
    percentOffensiveHalf: number;

    @Column("integer", {name: "percent_behind_ball"})
    percentBehindBall: number;

    @Column("integer", {name: "percent_infront_ball"})
    percentInfrontBall: number;

    @Column("integer", {name: "percent_most_back"})
    percentMostBack: number;

    @Column("integer", {name: "percent_most_forward"})
    percentMostForward: number;

    @Column("integer", {name: "percent_closest_to_ball"})
    percentClosestToBall: number;

    @Column("integer", {name: "percent_farthest_from_ball"})
    percentFarthestFromBall: number;

    @Column("integer", {name: "demos_inflicted"})
    demosInflicted: number;

    @Column("integer", {name: "demos_taken"})
    demosTaken: number;

    @Column("integer", {name: "avg_speed"})
    avgSpeed: number;

    @Column("integer", {name: "total_distance"})
    totalDistance: number;

    @Column("integer", {name: "time_supersonic_speed"})
    timeSupersonicSpeed: number;

    @Column("integer", {name: "time_boost_speed"})
    timeBoostSpeed: number;

    @Column("integer", {name: "time_slow_speed"})
    timeSlowSpeed: number;

    @Column("integer", {name: "time_ground"})
    timeGround: number;

    @Column("integer", {name: "time_low_air"})
    timeLowAir: number;

    @Column("integer", {name: "time_high_air"})
    timeHighAir: number;

    @Column("integer", {name: "time_powerslide"})
    timePowerslide: number;

    @Column("integer", {name: "count_powerslide"})
    countPowerslide: number;

    @Column("integer", {name: "avg_powerslide_duration"})
    avgPowerslideDuration: number;

    @Column("integer", {name: "avg_speed_percentage"})
    avgSpeedPercentage: number;

    @Column("integer", {name: "percent_slow_speed"})
    percentSlowSpeed: number;

    @Column("integer", {name: "percent_boost_speed"})
    percentBoostSpeed: number;

    @Column("integer", {name: "percent_supersonic_speed"})
    percentSupersonicSpeed: number;

    @Column("integer", {name: "percent_ground"})
    percentGround: number;

    @Column("integer", {name: "percent_low_air"})
    percentLowAir: number;

    @Column("integer", {name: "percent_high_air"})
    percentHighAir: number;

    @OneToOne(
        () => MLE_PlayerStatsCore,
        playerStatsCore => playerStatsCore.playerStats,
        {onUpdate: "CASCADE"},
    )
    @JoinColumn([ {name: "core_stats_id", referencedColumnName: "id"} ])
    coreStats: MLE_PlayerStatsCore;

    @ManyToOne(() => MLE_Player, {
        onUpdate: "CASCADE",
    })
    @JoinColumn([ {name: "player_id", referencedColumnName: "id"} ])
    player: MLE_Player;

    @ManyToOne(() => MLE_SeriesReplay, seriesReplay => seriesReplay.playerStats, {
        onUpdate: "CASCADE",
    })
    @JoinColumn([ {name: "replay_id", referencedColumnName: "id"} ])
    replay: MLE_SeriesReplay;
}
