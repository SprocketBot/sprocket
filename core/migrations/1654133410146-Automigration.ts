import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1654133410146 implements MigrationInterface {
    name = 'Automigration1654133410146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "start_time" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "end_time" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "car_id" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "steering_sensitivity" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "camera_fov" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "camera_height" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "camera_pitch" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "camera_distance" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "camera_stiffness" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "camera_swivel_speed" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "camera_transition_speed" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_per_minute" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_collected_per_minute" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_average" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_collected" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_stolen" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_collected_big" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_stolen_big" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_collected_small" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_stolen_small" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_count_collected_big" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_count_stolen_big" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_count_collected_small" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_count_stolen_small" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_overfill" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_overfill_stolen" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_wasted" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_time_empty" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_percent_empty" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_time_full" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_percent_full" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_time0to25" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_time25to50" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_time50to75" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_time75to100" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_percent0to25" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_percent25to50" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_percent50to75" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "boost_percent75to100" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "avg_distance_to_ball" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "avg_distance_to_ball_possession" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "avg_distance_to_ball_no_possession" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "avg_distance_to_mates" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "time_defensive_third" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "time_neutral_third" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "time_offensive_third" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "time_defensive_half" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "time_offensive_half" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "time_behind_ball" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "time_infront_ball" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "time_most_back" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "time_most_forward" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "goals_against_while_last_defender" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "time_closest_to_ball" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "time_farthest_from_ball" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "percent_defensive_third" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "percent_offensive_third" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "percent_neutral_third" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "percent_defensive_half" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "percent_offensive_half" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "percent_behind_ball" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "percent_infront_ball" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "percent_most_back" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "percent_most_forward" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "percent_closest_to_ball" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "percent_farthest_from_ball" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "demos_inflicted" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "demos_taken" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "avg_speed" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "total_distance" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "time_supersonic_speed" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "time_boost_speed" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "time_slow_speed" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "time_ground" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "time_low_air" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "time_high_air" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "time_powerslide" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "count_powerslide" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "avg_powerslide_duration" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "avg_speed_percentage" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "percent_slow_speed" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "percent_boost_speed" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "percent_supersonic_speed" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "percent_ground" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "percent_low_air" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats" ALTER COLUMN "percent_high_air" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."team_core_stats" ALTER COLUMN "goals" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."team_core_stats" ALTER COLUMN "goals_against" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."team_core_stats" ALTER COLUMN "possession_time" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."team_core_stats" ALTER COLUMN "time_in_side" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."psyonix_api_result" ALTER COLUMN "skill" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."psyonix_api_result" ALTER COLUMN "sigma" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "mledb"."psyonix_api_result" ALTER COLUMN "mu" TYPE numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

    }

}
