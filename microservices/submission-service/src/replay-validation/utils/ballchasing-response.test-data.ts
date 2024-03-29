import type {BallchasingResponse} from "@sprocketbot/common";
import {BallchasingResponseSchema} from "@sprocketbot/common";

export const rawResponse = {
    map_name: "",
    id: "f80a36de-378a-4d0d-83cc-97bae49abdce",
    link: "https://ballchasing.com/api/replays/f80a36de-378a-4d0d-83cc-97bae49abdce",
    created: "2022-10-28T03:38:29.079437Z",
    uploader: {
        steam_id: "76561198133080985",
        name: "Nigel Thornbrake",
        profile_url: "https://steamcommunity.com/id/rbtEngrDude/",
        avatar: "https://avatars.akamai.steamstatic.com/8cb477dd546755c5d21ce09902766bc046306dea.jpg",
    },
    status: "ok",
    rocket_league_id: "E662A0744EC29D7CAAD7B7A643ED4C0F",
    match_guid: "0696659211ED567193857DAF7057FF4F",
    title: "2022-10-27.20.38 Nigel Thornbrake Private Win",
    map_code: "utopiastadium_lux_p",
    match_type: "Private",
    team_size: 3,
    playlist_id: "private",
    duration: 342,
    overtime: false,
    season: 8,
    season_type: "free2play",
    date: "2022-10-27T20:38:40-07:00",
    date_has_timezone: true,
    visibility: "public",
    blue: {
        color: "blue",
        name: "FLAMES",
        players: [
            {
                start_time: 0,
                end_time: 342.6149,
                name: "Andrueninja",
                id: {
                    platform: "steam",
                    id: "76561198120437724",
                },
                car_id: 4284,
                car_name: "Fennec",
                camera: {
                    fov: 110,
                    height: 110,
                    pitch: -5,
                    distance: 230,
                    stiffness: 0.7,
                    swivel_speed: 4,
                    transition_speed: 1.7,
                },
                steering_sensitivity: 1.2,
                stats: {
                    core: {
                        shots: 4,
                        shots_against: 3,
                        goals: 0,
                        goals_against: 3,
                        saves: 0,
                        assists: 1,
                        score: 212,
                        mvp: false,
                        shooting_percentage: 0,
                    },
                    boost: {
                        bpm: 294,
                        bcpm: 299.83517,
                        avg_amount: 40.64,
                        amount_collected: 1637,
                        amount_stolen: 298,
                        amount_collected_big: 936,
                        amount_stolen_big: 0,
                        amount_collected_small: 701,
                        amount_stolen_small: 298,
                        count_collected_big: 11,
                        count_stolen_big: 0,
                        count_collected_small: 60,
                        count_stolen_small: 25,
                        amount_overfill: 170,
                        amount_overfill_stolen: 0,
                        amount_used_while_supersonic: 70,
                        time_zero_boost: 63.63,
                        percent_zero_boost: 19.424263,
                        time_full_boost: 26.64,
                        percent_full_boost: 8.132365,
                        time_boost_0_25: 128.3,
                        time_boost_25_50: 93.32,
                        time_boost_50_75: 62.92,
                        time_boost_75_100: 49.18,
                        percent_boost_0_25: 38.445408,
                        percent_boost_25_50: 27.963564,
                        percent_boost_50_75: 18.854132,
                        percent_boost_75_100: 14.736906,
                    },
                    movement: {
                        avg_speed: 1441,
                        total_distance: 461818,
                        time_supersonic_speed: 27.23,
                        time_boost_speed: 137.69,
                        time_slow_speed: 174.27,
                        time_ground: 184.78,
                        time_low_air: 138.59,
                        time_high_air: 15.82,
                        time_powerslide: 4.29,
                        count_powerslide: 30,
                        avg_powerslide_duration: 0.14,
                        avg_speed_percentage: 62.652172,
                        percent_slow_speed: 51.378277,
                        percent_boost_speed: 40.593765,
                        percent_supersonic_speed: 8.027948,
                        percent_ground: 54.47684,
                        percent_low_air: 40.859104,
                        percent_high_air: 4.6640525,
                    },
                    positioning: {
                        avg_distance_to_ball: 2476,
                        avg_distance_to_ball_possession: 2149,
                        avg_distance_to_ball_no_possession: 2730,
                        avg_distance_to_mates: 3440,
                        time_defensive_third: 132.63,
                        time_neutral_third: 114.59,
                        time_offensive_third: 91.97,
                        time_defensive_half: 198.98,
                        time_offensive_half: 140.2,
                        time_behind_ball: 232.1,
                        time_infront_ball: 107.09,
                        time_most_back: 89.2,
                        time_most_forward: 119.1,
                        goals_against_while_last_defender: 1,
                        time_closest_to_ball: 138.8,
                        time_farthest_from_ball: 75.3,
                        percent_defensive_third: 39.10198,
                        percent_offensive_third: 27.114595,
                        percent_neutral_third: 33.783424,
                        percent_defensive_half: 58.665016,
                        percent_offensive_half: 41.334984,
                        percent_behind_ball: 68.42773,
                        percent_infront_ball: 31.572275,
                        percent_most_back: 27.22999,
                        percent_most_forward: 36.357533,
                        percent_closest_to_ball: 42.37133,
                        percent_farthest_from_ball: 22.986753,
                    },
                    demo: {
                        inflicted: 0,
                        taken: 1,
                    },
                },
            },
            {
                start_time: 0,
                end_time: 342.6149,
                name: "Boby Shew",
                id: {
                    platform: "steam",
                    id: "76561198295649588",
                },
                car_id: 23,
                car_name: "Octane",
                camera: {
                    fov: 110,
                    height: 100,
                    pitch: -4,
                    distance: 230,
                    stiffness: 0.8,
                    swivel_speed: 7,
                    transition_speed: 1,
                },
                steering_sensitivity: 1,
                stats: {
                    core: {
                        shots: 2,
                        shots_against: 3,
                        goals: 1,
                        goals_against: 3,
                        saves: 0,
                        assists: 0,
                        score: 180,
                        mvp: false,
                        shooting_percentage: 50,
                    },
                    boost: {
                        bpm: 430,
                        bcpm: 423.28592,
                        avg_amount: 52.88,
                        amount_collected: 2311,
                        amount_stolen: 662,
                        amount_collected_big: 1698,
                        amount_stolen_big: 497,
                        amount_collected_small: 613,
                        amount_stolen_small: 165,
                        count_collected_big: 21,
                        count_stolen_big: 7,
                        count_collected_small: 58,
                        count_stolen_small: 16,
                        amount_overfill: 423,
                        amount_overfill_stolen: 202,
                        amount_used_while_supersonic: 318,
                        time_zero_boost: 11.06,
                        percent_zero_boost: 3.3762746,
                        time_full_boost: 37.23,
                        percent_full_boost: 11.365163,
                        time_boost_0_25: 78.08,
                        time_boost_25_50: 75.48,
                        time_boost_50_75: 76.32,
                        time_boost_75_100: 95.24,
                        percent_boost_0_25: 24.015749,
                        percent_boost_25_50: 23.216045,
                        percent_boost_50_75: 23.47441,
                        percent_boost_75_100: 29.2938,
                    },
                    movement: {
                        avg_speed: 1596,
                        total_distance: 504935,
                        time_supersonic_speed: 49.97,
                        time_boost_speed: 139.79,
                        time_slow_speed: 146.41,
                        time_ground: 209.77,
                        time_low_air: 115.31,
                        time_high_air: 11.08,
                        time_powerslide: 10.29,
                        count_powerslide: 91,
                        avg_powerslide_duration: 0.11,
                        avg_speed_percentage: 69.391304,
                        percent_slow_speed: 43.55237,
                        percent_boost_speed: 41.583122,
                        percent_supersonic_speed: 14.864503,
                        percent_ground: 62.401833,
                        percent_low_air: 34.302116,
                        percent_high_air: 3.2960494,
                    },
                    positioning: {
                        avg_distance_to_ball: 3107,
                        avg_distance_to_ball_possession: 3062,
                        avg_distance_to_ball_no_possession: 3109,
                        avg_distance_to_mates: 3685,
                        time_defensive_third: 153.93,
                        time_neutral_third: 98.15,
                        time_offensive_third: 84.09,
                        time_defensive_half: 199.68,
                        time_offensive_half: 136.49,
                        time_behind_ball: 240.34,
                        time_infront_ball: 95.83,
                        time_most_back: 130.3,
                        time_most_forward: 92.4,
                        goals_against_while_last_defender: 1,
                        time_closest_to_ball: 91.8,
                        time_farthest_from_ball: 137.4,
                        percent_defensive_third: 45.789333,
                        percent_offensive_third: 25.014132,
                        percent_neutral_third: 29.196539,
                        percent_defensive_half: 59.39852,
                        percent_offensive_half: 40.601486,
                        percent_behind_ball: 71.49359,
                        percent_infront_ball: 28.506413,
                        percent_most_back: 39.776546,
                        percent_most_forward: 28.206852,
                        percent_closest_to_ball: 28.02369,
                        percent_farthest_from_ball: 41.94395,
                    },
                    demo: {
                        inflicted: 2,
                        taken: 2,
                    },
                },
            },
            {
                start_time: 0,
                end_time: 342.6149,
                name: "David.",
                id: {
                    platform: "steam",
                    id: "76561198168202408",
                },
                car_id: 23,
                car_name: "Octane",
                camera: {
                    fov: 108,
                    height: 120,
                    pitch: -3,
                    distance: 230,
                    stiffness: 0.8,
                    swivel_speed: 5.6,
                    transition_speed: 1.2,
                },
                steering_sensitivity: 1,
                stats: {
                    core: {
                        shots: 2,
                        shots_against: 3,
                        goals: 0,
                        goals_against: 3,
                        saves: 0,
                        assists: 0,
                        score: 76,
                        mvp: false,
                        shooting_percentage: 0,
                    },
                    boost: {
                        bpm: 353,
                        bcpm: 335.1853,
                        avg_amount: 49.4,
                        amount_collected: 1830,
                        amount_stolen: 405,
                        amount_collected_big: 1116,
                        amount_stolen_big: 167,
                        amount_collected_small: 714,
                        amount_stolen_small: 238,
                        count_collected_big: 14,
                        count_stolen_big: 2,
                        count_collected_small: 64,
                        count_stolen_small: 21,
                        amount_overfill: 286,
                        amount_overfill_stolen: 33,
                        amount_used_while_supersonic: 315,
                        time_zero_boost: 22.13,
                        percent_zero_boost: 6.755602,
                        time_full_boost: 27.3,
                        percent_full_boost: 8.333842,
                        time_boost_0_25: 112.94,
                        time_boost_25_50: 77.54,
                        time_boost_50_75: 57.57,
                        time_boost_75_100: 76.54,
                        percent_boost_0_25: 34.794662,
                        percent_boost_25_50: 23.888596,
                        percent_boost_50_75: 17.73622,
                        percent_boost_75_100: 23.580515,
                    },
                    movement: {
                        avg_speed: 1626,
                        total_distance: 519748,
                        time_supersonic_speed: 56.92,
                        time_boost_speed: 148.1,
                        time_slow_speed: 133.77,
                        time_ground: 205.06,
                        time_low_air: 123.4,
                        time_high_air: 10.32,
                        time_powerslide: 8.57,
                        count_powerslide: 71,
                        avg_powerslide_duration: 0.12,
                        avg_speed_percentage: 70.695656,
                        percent_slow_speed: 39.48464,
                        percent_boost_speed: 43.7144,
                        percent_supersonic_speed: 16.80097,
                        percent_ground: 60.528957,
                        percent_low_air: 36.42482,
                        percent_high_air: 3.0462246,
                    },
                    positioning: {
                        avg_distance_to_ball: 3047,
                        avg_distance_to_ball_possession: 2672,
                        avg_distance_to_ball_no_possession: 3381,
                        avg_distance_to_mates: 3532,
                        time_defensive_third: 136.95,
                        time_neutral_third: 109.12,
                        time_offensive_third: 92.72,
                        time_defensive_half: 194.24,
                        time_offensive_half: 144.55,
                        time_behind_ball: 223.23,
                        time_infront_ball: 115.56,
                        time_most_back: 111.1,
                        time_most_forward: 113.4,
                        goals_against_while_last_defender: 1,
                        time_closest_to_ball: 96.8,
                        time_farthest_from_ball: 121.2,
                        percent_defensive_third: 40.42327,
                        percent_offensive_third: 27.367985,
                        percent_neutral_third: 32.20874,
                        percent_defensive_half: 57.33345,
                        percent_offensive_half: 42.666546,
                        percent_behind_ball: 65.89038,
                        percent_infront_ball: 34.109627,
                        percent_most_back: 33.915382,
                        percent_most_forward: 34.6175,
                        percent_closest_to_ball: 29.550035,
                        percent_farthest_from_ball: 36.998596,
                    },
                    demo: {
                        inflicted: 2,
                        taken: 1,
                    },
                },
            },
        ],
        stats: {
            ball: {
                possession_time: 135.45,
                time_in_side: 150.41,
            },
            core: {
                shots: 8,
                shots_against: 3,
                goals: 1,
                goals_against: 3,
                saves: 0,
                assists: 1,
                score: 468,
                shooting_percentage: 12.5,
            },
            boost: {
                bpm: 1077,
                bcpm: 1058.3064,
                avg_amount: 142.92001,
                amount_collected: 5778,
                amount_stolen: 1365,
                amount_collected_big: 3750,
                amount_stolen_big: 664,
                amount_collected_small: 2028,
                amount_stolen_small: 701,
                count_collected_big: 46,
                count_stolen_big: 9,
                count_collected_small: 182,
                count_stolen_small: 62,
                amount_overfill: 879,
                amount_overfill_stolen: 235,
                amount_used_while_supersonic: 703,
                time_zero_boost: 96.82,
                time_full_boost: 91.17,
                time_boost_0_25: 319.32,
                time_boost_25_50: 246.34,
                time_boost_50_75: 196.81,
                time_boost_75_100: 220.95999,
            },
            movement: {
                total_distance: 1486501,
                time_supersonic_speed: 134.12,
                time_boost_speed: 425.58,
                time_slow_speed: 454.45,
                time_ground: 599.61,
                time_low_air: 377.3,
                time_high_air: 37.22,
                time_powerslide: 23.15,
                count_powerslide: 192,
            },
            positioning: {
                time_defensive_third: 423.51,
                time_neutral_third: 321.86,
                time_offensive_third: 268.78,
                time_defensive_half: 592.89996,
                time_offensive_half: 421.24,
                time_behind_ball: 695.67,
                time_infront_ball: 318.47998,
            },
            demo: {
                inflicted: 4,
                taken: 4,
            },
        },
    },
    orange: {
        color: "orange",
        name: "TYRANTS",
        players: [
            {
                start_time: 0,
                end_time: 342.6149,
                name: "Kovalchuk",
                id: {
                    platform: "steam",
                    id: "76561197991590963",
                },
                mvp: true,
                car_id: 23,
                car_name: "Octane",
                camera: {
                    fov: 108,
                    height: 160,
                    pitch: -9,
                    distance: 360,
                    stiffness: 0.45,
                    swivel_speed: 1,
                    transition_speed: 1.2,
                },
                steering_sensitivity: 4.25,
                stats: {
                    core: {
                        shots: 3,
                        shots_against: 8,
                        goals: 3,
                        goals_against: 1,
                        saves: 1,
                        assists: 0,
                        score: 547,
                        mvp: true,
                        shooting_percentage: 100,
                    },
                    boost: {
                        bpm: 472,
                        bcpm: 460.10138,
                        avg_amount: 49.1,
                        amount_collected: 2512,
                        amount_stolen: 765,
                        amount_collected_big: 1951,
                        amount_stolen_big: 623,
                        amount_collected_small: 561,
                        amount_stolen_small: 142,
                        count_collected_big: 24,
                        count_stolen_big: 7,
                        count_collected_small: 43,
                        count_stolen_small: 13,
                        amount_overfill: 430,
                        amount_overfill_stolen: 84,
                        amount_used_while_supersonic: 786,
                        time_zero_boost: 41.34,
                        percent_zero_boost: 12.619819,
                        time_full_boost: 28.43,
                        percent_full_boost: 8.678797,
                        time_boost_0_25: 109.34,
                        time_boost_25_50: 89.2,
                        time_boost_50_75: 61.5,
                        time_boost_75_100: 71.98,
                        percent_boost_0_25: 32.93175,
                        percent_boost_25_50: 26.865852,
                        percent_boost_50_75: 18.522982,
                        percent_boost_75_100: 21.679419,
                    },
                    movement: {
                        avg_speed: 1580,
                        total_distance: 508977,
                        time_supersonic_speed: 82.79,
                        time_boost_speed: 118.08,
                        time_slow_speed: 141.31,
                        time_ground: 210.12,
                        time_low_air: 118.55,
                        time_high_air: 13.51,
                        time_powerslide: 8.64,
                        count_powerslide: 60,
                        avg_powerslide_duration: 0.14,
                        avg_speed_percentage: 68.695656,
                        percent_slow_speed: 41.296974,
                        percent_boost_speed: 34.508152,
                        percent_supersonic_speed: 24.194866,
                        percent_ground: 61.40628,
                        percent_low_air: 34.645508,
                        percent_high_air: 3.9482145,
                    },
                    positioning: {
                        avg_distance_to_ball: 2878,
                        avg_distance_to_ball_possession: 2777,
                        avg_distance_to_ball_no_possession: 2986,
                        avg_distance_to_mates: 3715,
                        time_defensive_third: 181.34,
                        time_neutral_third: 83.6,
                        time_offensive_third: 77.24,
                        time_defensive_half: 226.71,
                        time_offensive_half: 115.48,
                        time_behind_ball: 239.32,
                        time_infront_ball: 102.87,
                        time_most_back: 117.3,
                        time_most_forward: 121.3,
                        time_closest_to_ball: 117.4,
                        time_farthest_from_ball: 111.5,
                        percent_defensive_third: 52.995502,
                        percent_offensive_third: 22.572916,
                        percent_neutral_third: 24.431585,
                        percent_defensive_half: 66.25266,
                        percent_offensive_half: 33.747334,
                        percent_behind_ball: 69.93775,
                        percent_infront_ball: 30.062246,
                        percent_most_back: 35.80805,
                        percent_most_forward: 37.029125,
                        percent_closest_to_ball: 35.838573,
                        percent_farthest_from_ball: 34.037487,
                    },
                    demo: {
                        inflicted: 1,
                        taken: 0,
                    },
                },
            },
            {
                start_time: 0,
                end_time: 342.6149,
                name: "Nigel Thornbrake",
                id: {
                    platform: "epic",
                    id: "80fc09bb4a6f41688c316555a7606a4a",
                },
                car_id: 23,
                car_name: "Octane",
                camera: {
                    fov: 110,
                    height: 100,
                    pitch: -3,
                    distance: 280,
                    stiffness: 0.3,
                    swivel_speed: 2.5,
                    transition_speed: 1.5,
                },
                steering_sensitivity: 1,
                stats: {
                    core: {
                        shots: 0,
                        shots_against: 8,
                        goals: 0,
                        goals_against: 1,
                        saves: 4,
                        assists: 2,
                        score: 461,
                        mvp: false,
                        shooting_percentage: 0,
                    },
                    boost: {
                        bpm: 266,
                        bcpm: 311.19116,
                        avg_amount: 49.58,
                        amount_collected: 1699,
                        amount_stolen: 382,
                        amount_collected_big: 1049,
                        amount_stolen_big: 261,
                        amount_collected_small: 650,
                        amount_stolen_small: 121,
                        count_collected_big: 15,
                        count_stolen_big: 3,
                        count_collected_small: 56,
                        count_stolen_small: 11,
                        amount_overfill: 352,
                        amount_overfill_stolen: 5,
                        amount_used_while_supersonic: 142,
                        time_zero_boost: 40.19,
                        percent_zero_boost: 12.268759,
                        time_full_boost: 22.55,
                        percent_full_boost: 6.883815,
                        time_boost_0_25: 103.49,
                        time_boost_25_50: 63.83,
                        time_boost_50_75: 56.39,
                        time_boost_75_100: 91,
                        percent_boost_0_25: 32.88424,
                        percent_boost_25_50: 20.282164,
                        percent_boost_50_75: 17.918081,
                        percent_boost_75_100: 28.915508,
                    },
                    movement: {
                        avg_speed: 1343,
                        total_distance: 423063,
                        time_supersonic_speed: 17.75,
                        time_boost_speed: 120.26,
                        time_slow_speed: 197.06,
                        time_ground: 198.01,
                        time_low_air: 123.05,
                        time_high_air: 14.01,
                        time_powerslide: 11.35,
                        count_powerslide: 104,
                        avg_powerslide_duration: 0.11,
                        avg_speed_percentage: 58.391304,
                        percent_slow_speed: 58.811592,
                        percent_boost_speed: 35.891006,
                        percent_supersonic_speed: 5.2974005,
                        percent_ground: 59.09511,
                        percent_low_air: 36.723667,
                        percent_high_air: 4.181216,
                    },
                    positioning: {
                        avg_distance_to_ball: 2976,
                        avg_distance_to_ball_possession: 3104,
                        avg_distance_to_ball_no_possession: 2810,
                        avg_distance_to_mates: 3677,
                        time_defensive_third: 171.28,
                        time_neutral_third: 104.7,
                        time_offensive_third: 59.08,
                        time_defensive_half: 227.41,
                        time_offensive_half: 107.66,
                        time_behind_ball: 250.15,
                        time_infront_ball: 84.92,
                        time_most_back: 110.4,
                        time_most_forward: 85.3,
                        goals_against_while_last_defender: 1,
                        time_closest_to_ball: 102.5,
                        time_farthest_from_ball: 105.3,
                        percent_defensive_third: 51.1192,
                        percent_offensive_third: 17.632664,
                        percent_neutral_third: 31.248135,
                        percent_defensive_half: 67.8694,
                        percent_offensive_half: 32.1306,
                        percent_behind_ball: 74.656044,
                        percent_infront_ball: 25.343958,
                        percent_most_back: 33.70169,
                        percent_most_forward: 26.039442,
                        percent_closest_to_ball: 31.290068,
                        percent_farthest_from_ball: 32.14482,
                    },
                    demo: {
                        inflicted: 2,
                        taken: 2,
                    },
                },
            },
            {
                start_time: 0,
                end_time: 342.6149,
                name: "Precision",
                id: {
                    platform: "steam",
                    id: "76561198216346683",
                },
                car_id: 1568,
                car_name: "Octane ZSR",
                camera: {
                    fov: 110,
                    height: 100,
                    pitch: -3,
                    distance: 260,
                    stiffness: 0.35,
                    swivel_speed: 4.7,
                    transition_speed: 1.3,
                },
                steering_sensitivity: 1.8,
                stats: {
                    core: {
                        shots: 0,
                        shots_against: 8,
                        goals: 0,
                        goals_against: 1,
                        saves: 1,
                        assists: 0,
                        score: 96,
                        mvp: false,
                        shooting_percentage: 0,
                    },
                    boost: {
                        bpm: 408,
                        bcpm: 412.29626,
                        avg_amount: 55.67,
                        amount_collected: 2251,
                        amount_stolen: 370,
                        amount_collected_big: 1555,
                        amount_stolen_big: 200,
                        amount_collected_small: 696,
                        amount_stolen_small: 170,
                        count_collected_big: 17,
                        count_stolen_big: 2,
                        count_collected_small: 54,
                        count_stolen_small: 11,
                        amount_overfill: 185,
                        amount_overfill_stolen: 17,
                        amount_used_while_supersonic: 182,
                        time_zero_boost: 56.2,
                        percent_zero_boost: 17.156115,
                        time_full_boost: 51.92,
                        percent_full_boost: 15.849565,
                        time_boost_0_25: 106,
                        time_boost_25_50: 62.16,
                        time_boost_50_75: 54.27,
                        time_boost_75_100: 109.38,
                        percent_boost_0_25: 31.945993,
                        percent_boost_25_50: 18.733612,
                        percent_boost_50_75: 16.355745,
                        percent_boost_75_100: 32.96465,
                    },
                    movement: {
                        avg_speed: 1528,
                        total_distance: 484274,
                        time_supersonic_speed: 42.2,
                        time_boost_speed: 146.35,
                        time_slow_speed: 147.66,
                        time_ground: 199.27,
                        time_low_air: 123.15,
                        time_high_air: 13.78,
                        time_powerslide: 6.35,
                        count_powerslide: 71,
                        avg_powerslide_duration: 0.09,
                        avg_speed_percentage: 66.434784,
                        percent_slow_speed: 43.918976,
                        percent_boost_speed: 43.529343,
                        percent_supersonic_speed: 12.551679,
                        percent_ground: 59.271263,
                        percent_low_air: 36.629982,
                        percent_high_air: 4.0987506,
                    },
                    positioning: {
                        avg_distance_to_ball: 3082,
                        avg_distance_to_ball_possession: 3071,
                        avg_distance_to_ball_no_possession: 3083,
                        avg_distance_to_mates: 3687,
                        time_defensive_third: 185.54,
                        time_neutral_third: 97.22,
                        time_offensive_third: 53.44,
                        time_defensive_half: 241.59,
                        time_offensive_half: 94.61,
                        time_behind_ball: 227.8,
                        time_infront_ball: 108.41,
                        time_most_back: 110.8,
                        time_most_forward: 118.7,
                        time_closest_to_ball: 104.8,
                        time_farthest_from_ball: 117.3,
                        percent_defensive_third: 55.187386,
                        percent_offensive_third: 15.8953,
                        percent_neutral_third: 28.91731,
                        percent_defensive_half: 71.85901,
                        percent_offensive_half: 28.140987,
                        percent_behind_ball: 67.755264,
                        percent_infront_ball: 32.244724,
                        percent_most_back: 33.8238,
                        percent_most_forward: 36.235424,
                        percent_closest_to_ball: 31.992186,
                        percent_farthest_from_ball: 35.80805,
                    },
                    demo: {
                        inflicted: 1,
                        taken: 2,
                    },
                },
            },
        ],
        stats: {
            ball: {
                possession_time: 149.41,
                time_in_side: 171.61,
            },
            core: {
                shots: 3,
                shots_against: 8,
                goals: 3,
                goals_against: 1,
                saves: 6,
                assists: 2,
                score: 1104,
                shooting_percentage: 100,
            },
            boost: {
                bpm: 1146,
                bcpm: 1183.5889,
                avg_amount: 154.35,
                amount_collected: 6462,
                amount_stolen: 1517,
                amount_collected_big: 4555,
                amount_stolen_big: 1084,
                amount_collected_small: 1907,
                amount_stolen_small: 433,
                count_collected_big: 56,
                count_stolen_big: 12,
                count_collected_small: 153,
                count_stolen_small: 35,
                amount_overfill: 967,
                amount_overfill_stolen: 106,
                amount_used_while_supersonic: 1110,
                time_zero_boost: 137.73,
                time_full_boost: 102.899994,
                time_boost_0_25: 318.83,
                time_boost_25_50: 215.19,
                time_boost_50_75: 172.16,
                time_boost_75_100: 272.36002,
            },
            movement: {
                total_distance: 1416314,
                time_supersonic_speed: 142.74,
                time_boost_speed: 384.69,
                time_slow_speed: 486.03,
                time_ground: 607.4,
                time_low_air: 364.75,
                time_high_air: 41.3,
                time_powerslide: 26.340002,
                count_powerslide: 235,
            },
            positioning: {
                time_defensive_third: 538.16,
                time_neutral_third: 285.52,
                time_offensive_third: 189.76001,
                time_defensive_half: 695.70996,
                time_offensive_half: 317.75,
                time_behind_ball: 717.27,
                time_infront_ball: 296.2,
            },
            demo: {
                inflicted: 4,
                taken: 4,
            },
        },
    },
    playlist_name: "Private",
};

export const testResponse: BallchasingResponse = BallchasingResponseSchema.parse(rawResponse);
