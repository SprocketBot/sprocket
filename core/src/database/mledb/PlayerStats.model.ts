import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from "typeorm";

import {MLE_Player} from "./Player.model";
import {MLE_PlayerStatsCore} from "./PlayerStatsCore.model";
import {MLE_SeriesReplay} from "./SeriesReplay.model";

@Index("player_stats_core_stats_id_unique", ["coreStatsId"], {unique: true})
@Index("player_stats_pkey", ["id"], {unique: true})
@Entity("player_stats", {schema: "mledb"})
export class MLE_PlayerStats {
    @PrimaryGeneratedColumn({type: "numeric", name: "id"})
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

    @Column("numeric", {name: "start_time"})
    startTime: number;

    @Column("numeric", {name: "end_time"})
    endTime: number;

    @Column("character varying", {name: "car_name", length: 255})
    carName: string;

    @Column("numeric", {name: "car_id"})
    carId: number;

    @Column("numeric", {name: "steering_sensitivity"})
    steeringSensitivity: number;

    @Column("character varying", {name: "player_platform", length: 255})
    playerPlatform: string;

    @Column("numeric", {name: "camera_fov"})
    cameraFov: number;

    @Column("numeric", {name: "camera_height"})
    cameraHeight: number;

    @Column("numeric", {name: "camera_pitch"})
    cameraPitch: number;

    @Column("numeric", {name: "camera_distance"})
    cameraDistance: number;

    @Column("numeric", {name: "camera_stiffness"})
    cameraStiffness: number;

    @Column("numeric", {name: "camera_swivel_speed"})
    cameraSwivelSpeed: number;

    @Column("numeric", {name: "camera_transition_speed"})
    cameraTransitionSpeed: number;

    @Column("numeric", {name: "core_stats_id", unique: true})
    coreStatsId: number;

    @Column("numeric", {name: "boost_per_minute"})
    boostPerMinute: number;

    @Column("numeric", {name: "boost_collected_per_minute"})
    boostCollectedPerMinute: number;

    @Column("numeric", {name: "boost_average"})
    boostAverage: number;

    @Column("numeric", {name: "boost_collected"})
    boostCollected: number;

    @Column("numeric", {name: "boost_stolen"})
    boostStolen: number;

    @Column("numeric", {name: "boost_collected_big"})
    boostCollectedBig: number;

    @Column("numeric", {name: "boost_stolen_big"})
    boostStolenBig: number;

    @Column("numeric", {name: "boost_collected_small"})
    boostCollectedSmall: number;

    @Column("numeric", {name: "boost_stolen_small"})
    boostStolenSmall: number;

    @Column("numeric", {name: "boost_count_collected_big"})
    boostCountCollectedBig: number;

    @Column("numeric", {name: "boost_count_stolen_big"})
    boostCountStolenBig: number;

    @Column("numeric", {name: "boost_count_collected_small"})
    boostCountCollectedSmall: number;

    @Column("numeric", {name: "boost_count_stolen_small"})
    boostCountStolenSmall: number;

    @Column("numeric", {name: "boost_overfill"})
    boostOverfill: number;

    @Column("numeric", {name: "boost_overfill_stolen"})
    boostOverfillStolen: number;

    @Column("numeric", {name: "boost_wasted"})
    boostWasted: number;

    @Column("numeric", {name: "boost_time_empty"})
    boostTimeEmpty: number;

    @Column("numeric", {name: "boost_percent_empty"})
    boostPercentEmpty: number;

    @Column("numeric", {name: "boost_time_full"})
    boostTimeFull: number;

    @Column("numeric", {name: "boost_percent_full"})
    boostPercentFull: number;

    @Column("numeric", {name: "boost_time0to25"})
    boostTime0to25: number;

    @Column("numeric", {name: "boost_time25to50"})
    boostTime25to50: number;

    @Column("numeric", {name: "boost_time50to75"})
    boostTime50to75: number;

    @Column("numeric", {name: "boost_time75to100"})
    boostTime75to100: number;

    @Column("numeric", {name: "boost_percent0to25"})
    boostPercent0to25: number;

    @Column("numeric", {name: "boost_percent25to50"})
    boostPercent25to50: number;

    @Column("numeric", {name: "boost_percent50to75"})
    boostPercent50to75: number;

    @Column("numeric", {name: "boost_percent75to100"})
    boostPercent75to100: number;

    @Column("numeric", {name: "avg_distance_to_ball"})
    avgDistanceToBall: number;

    @Column("numeric", {name: "avg_distance_to_ball_possession"})
    avgDistanceToBallPossession: number;

    @Column("numeric", {name: "avg_distance_to_ball_no_possession"})
    avgDistanceToBallNoPossession: number;

    @Column("numeric", {name: "avg_distance_to_mates"})
    avgDistanceToMates: number;

    @Column("numeric", {name: "time_defensive_third"})
    timeDefensiveThird: number;

    @Column("numeric", {name: "time_neutral_third"})
    timeNeutralThird: number;

    @Column("numeric", {name: "time_offensive_third"})
    timeOffensiveThird: number;

    @Column("numeric", {name: "time_defensive_half"})
    timeDefensiveHalf: number;

    @Column("numeric", {name: "time_offensive_half"})
    timeOffensiveHalf: number;

    @Column("numeric", {name: "time_behind_ball"})
    timeBehindBall: number;

    @Column("numeric", {name: "time_infront_ball"})
    timeInfrontBall: number;

    @Column("numeric", {name: "time_most_back"})
    timeMostBack: number;

    @Column("numeric", {name: "time_most_forward"})
    timeMostForward: number;

    @Column("numeric", {name: "goals_against_while_last_defender"})
    goalsAgainstWhileLastDefender: number;

    @Column("numeric", {name: "time_closest_to_ball"})
    timeClosestToBall: number;

    @Column("numeric", {name: "time_farthest_from_ball"})
    timeFarthestFromBall: number;

    @Column("numeric", {name: "percent_defensive_third"})
    percentDefensiveThird: number;

    @Column("numeric", {name: "percent_offensive_third"})
    percentOffensiveThird: number;

    @Column("numeric", {name: "percent_neutral_third"})
    percentNeutralThird: number;

    @Column("numeric", {name: "percent_defensive_half"})
    percentDefensiveHalf: number;

    @Column("numeric", {name: "percent_offensive_half"})
    percentOffensiveHalf: number;

    @Column("numeric", {name: "percent_behind_ball"})
    percentBehindBall: number;

    @Column("numeric", {name: "percent_infront_ball"})
    percentInfrontBall: number;

    @Column("numeric", {name: "percent_most_back"})
    percentMostBack: number;

    @Column("numeric", {name: "percent_most_forward"})
    percentMostForward: number;

    @Column("numeric", {name: "percent_closest_to_ball"})
    percentClosestToBall: number;

    @Column("numeric", {name: "percent_farthest_from_ball"})
    percentFarthestFromBall: number;

    @Column("numeric", {name: "demos_inflicted"})
    demosInflicted: number;

    @Column("numeric", {name: "demos_taken"})
    demosTaken: number;

    @Column("numeric", {name: "avg_speed"})
    avgSpeed: number;

    @Column("numeric", {name: "total_distance"})
    totalDistance: number;

    @Column("numeric", {name: "time_supersonic_speed"})
    timeSupersonicSpeed: number;

    @Column("numeric", {name: "time_boost_speed"})
    timeBoostSpeed: number;

    @Column("numeric", {name: "time_slow_speed"})
    timeSlowSpeed: number;

    @Column("numeric", {name: "time_ground"})
    timeGround: number;

    @Column("numeric", {name: "time_low_air"})
    timeLowAir: number;

    @Column("numeric", {name: "time_high_air"})
    timeHighAir: number;

    @Column("numeric", {name: "time_powerslide"})
    timePowerslide: number;

    @Column("numeric", {name: "count_powerslide"})
    countPowerslide: number;

    @Column("numeric", {name: "avg_powerslide_duration"})
    avgPowerslideDuration: number;

    @Column("numeric", {name: "avg_speed_percentage"})
    avgSpeedPercentage: number;

    @Column("numeric", {name: "percent_slow_speed"})
    percentSlowSpeed: number;

    @Column("numeric", {name: "percent_boost_speed"})
    percentBoostSpeed: number;

    @Column("numeric", {name: "percent_supersonic_speed"})
    percentSupersonicSpeed: number;

    @Column("numeric", {name: "percent_ground"})
    percentGround: number;

    @Column("numeric", {name: "percent_low_air"})
    percentLowAir: number;

    @Column("numeric", {name: "percent_high_air"})
    percentHighAir: number;

    @OneToOne(
        () => MLE_PlayerStatsCore,
        playerStatsCore => playerStatsCore.playerStats,
        {onUpdate: "CASCADE"},
    )
    @JoinColumn([{name: "core_stats_id", referencedColumnName: "id"}])
    coreStats: MLE_PlayerStatsCore;

    @ManyToOne(() => MLE_Player, {
        onUpdate: "CASCADE",
    })
    @JoinColumn([{name: "player_id", referencedColumnName: "id"}])
    player: MLE_Player;

    @ManyToOne(
        () => MLE_SeriesReplay,
        seriesReplay => seriesReplay.playerStats,
        {
            onUpdate: "CASCADE",
        },
    )
    @JoinColumn([{name: "replay_id", referencedColumnName: "id"}])
    replay: MLE_SeriesReplay;
}
