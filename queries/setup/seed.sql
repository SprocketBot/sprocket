INSERT INTO sprocket.organization ("id")
VALUES (1),
       (2);

INSERT INTO sprocket.organization_profile ("id", "organizationId", "name", "description", "websiteUrl", "primaryColor",
                                           "secondaryColor",
                                           "logoUrl")
VALUES (1, 1, 'Sprocket', 'Sprocket', 'https://github.com/SprocketBot', '#F5C04E', '#0D0E0E',
        'https://i.ibb.co/BnQ9hmB/Sprocket-Logo-Yellow-3.png'),
       (2, 2, 'Minor League Esports', 'Minor League Esports', 'https://mlesports.gg/', '#2A4B82', '#FFFFFF',
        'https://mlesports.gg/wp-content/uploads/logo-mle-256.png');

INSERT INTO sprocket.game ("id", "title")
VALUES (1, 'Rocket League');

INSERT INTO sprocket.game_mode ("code", "description", "teamSize", "teamCount", "gameId")
VALUES ('RL_DUEL', 'Duel', 1, 2, 1),
       ('RL_DOUBLES', 'Doubles', 2, 2, 1),
       ('RL_STANDARD', 'Standard', 3, 2, 1);

INSERT INTO sprocket.schedule_group_type ("id", "name", "code", "organizationId")
VALUES (1, 'Season', 'SEASON', 1);

INSERT INTO sprocket.roster_role_use_limits ("code", "perMode", "total", "groupTypeId")
VALUES ('PL', 0, 0, 1),
       ('ML', 0, 0, 1),
       ('CL', 0, 0, 1),
       ('AL', 0, 0, 1),
       ('FL', 0, 0, 1);

INSERT INTO sprocket.game_skill_group ("id", "ordinal", "salaryCap", "roleUseLimitsId", "gameId")
VALUES (1, 1, 1, 1, 1),
       (2, 2, 2, 2, 1),
       (3, 3, 3, 3, 1),
       (4, 4, 4, 4, 1),
       (5, 5, 5, 5, 1);

INSERT INTO sprocket.game_skill_group_profile ("id", "skillGroupId", "code", "description", "scrimReportWebhookUrl",
                                               "matchReportWebhookUrl")
VALUES (1, 1, 'PL', 'Premier League', null, null),
       (2, 2, 'ML', 'Master League', null, null),
       (3, 3, 'CL', 'Champion League', null, null),
       (4, 4, 'AL', 'Academy League', null, null),
       (5, 5, 'FL', 'Foundation League', null, null);

INSERT INTO sprocket.organization_configuration_key ("id", "default", "code", "type")
VALUES (1, '1440', 'SCRIM_QUEUE_BAN_INITIAL_DURATION_MINUTES', 'FLOAT'),
       (2, '60', 'SCRIM_QUEUE_BAN_DURATION_MODIFIER', 'FLOAT'),
       (3, '10', 'SCRIM_QUEUE_BAN_CHECKIN_TIMEOUT_MINUTES', 'FLOAT'),
       (4, '30', 'SCRIM_QUEUE_BAN_MODIFIER_FALL_OFF_DAYS', 'INTEGER'),
       (5, '0', 'PRIMARY_DISCORD_GUILD_SNOWFLAKE', 'STRING'),
       (6, '[]', 'ALTERNATE_DISCORD_GUILD_SNOWFLAKES', 'ARRAY_STRING');

INSERT INTO sprocket.organization_configuration_value ("keyId", "organizationId", "value")
VALUES (5, 1, '856290331279884288'),
       (6, 1, '["984300673787113512"]');

INSERT INTO sprocket.platform ("code")
VALUES ('STEAM'), ('EPIC'), ('XBOX'), ('PS4');

INSERT INTO sprocket.image_template ("templateStructure", "reportCode", "displayName", description, query)
VALUES ('{
  "game": {
    "title": {
      "type": "text",
      "description": "Game Title (CL 2S ROUND ROBIN)"
    },
    "league": {
      "type": "text",
      "description": "League for Scrim (Champion)"
    },
    "mode_short": {
      "type": "text",
      "description": "Shortened Game Mode (2S)"
    },
    "scrim_mode": {
      "type": "text",
      "description": "Scrim Mode (Doubles)"
    },
    "scrim_type": {
      "type": "text",
      "description": "Scrim Type (Round Robin)"
    },
    "league_logo": {
      "type": "image",
      "description": "League logo url"
    },
    "league_color": {
      "type": "color",
      "description": "Color of League (#7E55CE)"
    },
    "league_short": {
      "type": "text",
      "description": "Shortened League Name (CL)"
    },
    "series_score": {
      "type": "text",
      "description": "series scoreline (1 - 2)"
    },
    "winning_color": {
      "type": "color",
      "description": "Color that won more games (#FC7C0C)"
    }
  },
  "games_data": [
    {
      "result": {
        "type": "text",
        "description": "result of the first game in the series (1 - 2)"
      },
      "blue_goals": {
        "type": "number",
        "description": "number of goals scored by blue team"
      },
      "blue_players": [
        {
          "name": {
            "type": "text",
            "description": "name of first player on the blue team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of second player on the blue team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of third player on the blue team (may be empty)"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        }
      ],
      "orange_goals": {
        "type": "number",
        "description": "number of goals scored by blue team"
      },
      "winning_color": {
        "type": "color",
        "description": "winning team color #FC7C0C"
      },
      "orange_players": [
        {
          "name": {
            "type": "text",
            "description": "name of first player on the orange team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of second player on the orange team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of third player on the orange team (may be empty)"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        }
      ]
    },
    {
      "result": {
        "type": "text",
        "description": "result of the second game in the series (1 - 2)"
      },
      "blue_goals": {
        "type": "number",
        "description": "number of goals scored by blue team"
      },
      "blue_players": [
        {
          "name": {
            "type": "text",
            "description": "name of first player on the blue team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of second player on the blue team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of third player on the blue team (may be empty)"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        }
      ],
      "orange_goals": {
        "type": "number",
        "description": "number of goals scored by blue team"
      },
      "winning_color": {
        "type": "color",
        "description": "winning team color #FC7C0C"
      },
      "orange_players": [
        {
          "name": {
            "type": "text",
            "description": "name of first player on the orange team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of second player on the orange team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of third player on the orange team (may be empty)"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        }
      ]
    },
    {
      "result": {
        "type": "text",
        "description": "result of the third game in the series (1 - 2)"
      },
      "blue_goals": {
        "type": "number",
        "description": "number of goals scored by blue team"
      },
      "blue_players": [
        {
          "name": {
            "type": "text",
            "description": "name of first player on the blue team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of second player on the blue team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of third player on the blue team (may be empty)"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        }
      ],
      "orange_goals": {
        "type": "number",
        "description": "number of goals scored by blue team"
      },
      "winning_color": {
        "type": "color",
        "description": "winning team color #FC7C0C"
      },
      "orange_players": [
        {
          "name": {
            "type": "text",
            "description": "name of first player on the orange team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of second player on the orange team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of third player on the orange team (may be empty)"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        }
      ]
    },
    {
      "result": {
        "type": "text",
        "description": "result of the fourth game in the series (1 - 2)"
      },
      "blue_goals": {
        "type": "number",
        "description": "number of goals scored by blue team"
      },
      "blue_players": [
        {
          "name": {
            "type": "text",
            "description": "name of first player on the blue team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of second player on the blue team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of third player on the blue team (may be empty)"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        }
      ],
      "orange_goals": {
        "type": "number",
        "description": "number of goals scored by blue team"
      },
      "winning_color": {
        "type": "color",
        "description": "winning team color #FC7C0C"
      },
      "orange_players": [
        {
          "name": {
            "type": "text",
            "description": "name of first player on the orange team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of second player on the orange team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of third player on the orange team (may be empty)"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        }
      ]
    },
    {
      "result": {
        "type": "text",
        "description": "result of the fifth game in the series (1 - 2) (may be empty)"
      },
      "blue_goals": {
        "type": "number",
        "description": "number of goals scored by blue team"
      },
      "blue_players": [
        {
          "name": {
            "type": "text",
            "description": "name of first player on the blue team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of second player on the blue team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of third player on the blue team (may be empty)"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        }
      ],
      "orange_goals": {
        "type": "number",
        "description": "number of goals scored by blue team"
      },
      "winning_color": {
        "type": "color",
        "description": "winning team color #FC7C0C"
      },
      "orange_players": [
        {
          "name": {
            "type": "text",
            "description": "name of first player on the orange team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of second player on the orange team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of third player on the orange team (may be empty)"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        }
      ]
    },
    {
      "result": {
        "type": "text",
        "description": "result of the sixth game in the series (1 - 2) (may be empty)"
      },
      "blue_goals": {
        "type": "number",
        "description": "number of goals scored by blue team"
      },
      "blue_players": [
        {
          "name": {
            "type": "text",
            "description": "name of first player on the blue team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of second player on the blue team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of third player on the blue team (may be empty)"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        }
      ],
      "orange_goals": {
        "type": "number",
        "description": "number of goals scored by blue team"
      },
      "winning_color": {
        "type": "color",
        "description": "winning team color #FC7C0C"
      },
      "orange_players": [
        {
          "name": {
            "type": "text",
            "description": "name of first player on the orange team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of second player on the orange team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of third player on the orange team (may be empty)"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        }
      ]
    },
    {
      "result": {
        "type": "text",
        "description": "result of the seventh game in the series (1 - 2) (may be empty"
      },
      "blue_goals": {
        "type": "number",
        "description": "number of goals scored by blue team"
      },
      "blue_players": [
        {
          "name": {
            "type": "text",
            "description": "name of first player on the blue team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of second player on the blue team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of third player on the blue team (may be empty)"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        }
      ],
      "orange_goals": {
        "type": "number",
        "description": "number of goals scored by blue team"
      },
      "winning_color": {
        "type": "color",
        "description": "winning team color #FC7C0C"
      },
      "orange_players": [
        {
          "name": {
            "type": "text",
            "description": "name of first player on the orange team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of second player on the orange team"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        },
        {
          "name": {
            "type": "text",
            "description": "name of third player on the orange team (may be empty)"
          },
          "goals": {
            "type": "number",
            "description": "goals"
          },
          "saves": {
            "type": "number",
            "description": "saves"
          },
          "score": {
            "type": "number",
            "description": "scoreboard score"
          },
          "shots": {
            "type": "number",
            "description": "shots"
          },
          "rating": {
            "type": "number",
            "description": "sprocket rating"
          },
          "assists": {
            "type": "number",
            "description": "assists"
          },
          "team_color": {
            "type": "color",
            "description": "team color for player (#0C2CFC)"
          },
          "player_color": {
            "type": "color",
            "description": "color assigned to player (#0097D7)"
          }
        }
      ]
    }
  ],
  "player_data": [
    {
      "name": {
        "type": "text",
        "description": "name of #1 player based on record then rating"
      },
      "wins": {
        "type": "number",
        "description": "# of wins"
      },
      "goals": {
        "type": "number",
        "description": "goals"
      },
      "saves": {
        "type": "number",
        "description": "saves"
      },
      "shots": {
        "type": "number",
        "description": "shots"
      },
      "losses": {
        "type": "number",
        "description": "# of losses"
      },
      "rating": {
        "type": "number",
        "description": "sprocket rating"
      },
      "record": {
        "type": "text",
        "description": "record"
      },
      "assists": {
        "type": "number",
        "description": "assists"
      },
      "team_color": {
        "type": "color",
        "description": "team color (#FFFFFF00)"
      },
      "player_color": {
        "type": "color",
        "description": "assigned player color (#F54C91)"
      }
    },
    {
      "name": {
        "type": "text",
        "description": "name of #2"
      },
      "wins": {
        "type": "number",
        "description": "# of wins"
      },
      "goals": {
        "type": "number",
        "description": "goals"
      },
      "saves": {
        "type": "number",
        "description": "saves"
      },
      "shots": {
        "type": "number",
        "description": "shots"
      },
      "losses": {
        "type": "number",
        "description": "# of losses"
      },
      "rating": {
        "type": "number",
        "description": "sprocket rating"
      },
      "record": {
        "type": "text",
        "description": "record"
      },
      "assists": {
        "type": "number",
        "description": "assists"
      },
      "team_color": {
        "type": "color",
        "description": "team color (#FFFFFF00)"
      },
      "player_color": {
        "type": "color",
        "description": "assigned player color (#F54C91)"
      }
    },
    {
      "name": {
        "type": "text",
        "description": "name of #3"
      },
      "wins": {
        "type": "number",
        "description": "# of wins"
      },
      "goals": {
        "type": "number",
        "description": "goals"
      },
      "saves": {
        "type": "number",
        "description": "saves"
      },
      "shots": {
        "type": "number",
        "description": "shots"
      },
      "losses": {
        "type": "number",
        "description": "# of losses"
      },
      "rating": {
        "type": "number",
        "description": "sprocket rating"
      },
      "record": {
        "type": "text",
        "description": "record"
      },
      "assists": {
        "type": "number",
        "description": "assists"
      },
      "team_color": {
        "type": "color",
        "description": "team color (#FFFFFF00)"
      },
      "player_color": {
        "type": "color",
        "description": "assigned player color (#F54C91)"
      }
    },
    {
      "name": {
        "type": "text",
        "description": "name of #4"
      },
      "wins": {
        "type": "number",
        "description": "# of wins"
      },
      "goals": {
        "type": "number",
        "description": "goals"
      },
      "saves": {
        "type": "number",
        "description": "saves"
      },
      "shots": {
        "type": "number",
        "description": "shots"
      },
      "losses": {
        "type": "number",
        "description": "# of losses"
      },
      "rating": {
        "type": "number",
        "description": "sprocket rating"
      },
      "record": {
        "type": "text",
        "description": "record"
      },
      "assists": {
        "type": "number",
        "description": "assists"
      },
      "team_color": {
        "type": "color",
        "description": "team color (#FFFFFF00)"
      },
      "player_color": {
        "type": "color",
        "description": "assigned player color (#F54C91)"
      }
    },
    {
      "name": {
        "type": "text",
        "description": "name of #5"
      },
      "wins": {
        "type": "number",
        "description": "# of wins"
      },
      "goals": {
        "type": "number",
        "description": "goals"
      },
      "saves": {
        "type": "number",
        "description": "saves"
      },
      "shots": {
        "type": "number",
        "description": "shots"
      },
      "losses": {
        "type": "number",
        "description": "# of losses"
      },
      "rating": {
        "type": "number",
        "description": "sprocket rating"
      },
      "record": {
        "type": "text",
        "description": "record"
      },
      "assists": {
        "type": "number",
        "description": "assists"
      },
      "team_color": {
        "type": "color",
        "description": "team color (#FFFFFF00)"
      },
      "player_color": {
        "type": "color",
        "description": "assigned player color (#F54C91)"
      }
    },
    {
      "name": {
        "type": "text",
        "description": "name of #6"
      },
      "wins": {
        "type": "number",
        "description": "# of wins"
      },
      "goals": {
        "type": "number",
        "description": "goals"
      },
      "saves": {
        "type": "number",
        "description": "saves"
      },
      "shots": {
        "type": "number",
        "description": "shots"
      },
      "losses": {
        "type": "number",
        "description": "# of losses"
      },
      "rating": {
        "type": "number",
        "description": "sprocket rating"
      },
      "record": {
        "type": "text",
        "description": "record"
      },
      "assists": {
        "type": "number",
        "description": "assists"
      },
      "team_color": {
        "type": "color",
        "description": "team color (#FFFFFF00)"
      },
      "player_color": {
        "type": "color",
        "description": "assigned player color (#F54C91)"
      }
    }
  ],
  "organization": {
    "name": {
      "type": "text",
      "description": "Org Name"
    },
    "logo_url": {
      "type": "image",
      "description": "link to org logo"
    },
    "webisite": {
      "type": "text",
      "description": "Org website URL"
    },
    "description": {
      "type": "text",
      "description": "Org Description"
    },
    "primary_color": {
      "type": "color",
      "description": "Org Primary color (#F5C04E)"
    },
    "secondary_color": {
      "type": "color",
      "description": "Org Secondary color (#0D0E0E)"
    }
  }
}', 'scrim_report_cards', 'Scrim Data', 'Data for scrims of all types', '{
  "query": "WITH \nvars AS (SELECT \n\t\t \t$1::numeric AS scrim_id,\n\t\t\t$2::numeric AS org_id\n\t\t),\n\ncolors AS (\n\tSELECT * FROM (VALUES \t(1, ''#F54C91''),\n\t\t\t\t\t\t\t(2, ''#0097D7''),\n\t\t\t\t\t\t\t(3, ''#189666''),\n\t\t\t\t\t\t\t(4, ''#DE7327''),\n\t\t\t\t\t\t\t(5, ''#FDBD2A''),\n\t\t\t\t\t\t\t(6, ''#1D308F'')\n\t\t\t\t) t1 (number, color)\n),\n\norganization AS (\n\tSELECT\n\t\tjsonb_build_object(''type'', ''text'', ''value'', op.name) AS name,\n\t\tjsonb_build_object(''type'', ''text'', ''value'', op.description) AS description,\n\t\tjsonb_build_object(''type'', ''text'', ''value'', op.\"websiteUrl\") AS webisite,\n\t\tjsonb_build_object(''type'', ''color'', ''value'', op.\"primaryColor\") AS primary_color,\n\t\tjsonb_build_object(''type'', ''color'', ''value'', op.\"secondaryColor\") AS secondary_color,\n\t\tjsonb_build_object(''type'', ''image'', ''value'', op.\"logoUrl\") AS logo_url\n\n\tFROM sprocket.organization_profile op\n\tINNER JOIN vars v\n\tON op.id = v.org_id\n),\n\ngame_stats AS(\n\tSELECT\n\t\tv.scrim_id as scrim_id,\n\t\tsr.id as replay_id,\n\t\tsr.winning_color,\n\t\tpsc.color as player_team_color,\n\t\tpsc.mvpr,\n\t\tpsc.score,\n\t\tpsc.goals,\n\t\tpsc.assists,\n\t\tpsc.saves,\n\t\tpsc.shots,\n\t\tpsc.gpi,\n\t\tp.name as player_name\n\tFROM\t\tvars v\n\tINNER JOIN \tmledb.series s\n\tON \t\t\tv.scrim_id = s.scrim_id\n\tINNER JOIN\tmledb.series_replay sr\n\tON\t\t\tsr.series_id = s.id\n\tINNER JOIN\tmledb.player_stats_core psc\n\tON\t\t\tsr.id = psc.replay_id\n\tINNER JOIN\tmledb.player p\n\tON\t\t\tpsc.player_id = p.id\n),\n\ngame_info AS (\n\tWITH series_score AS (\n\t\tSELECT\n\t\t\tv.scrim_id,\n\t\t\tCount(DISTINCT replay_id) filter (WHERE winning_color = ''BLUE'') as blue_wins,\n\t\t\tCount(DISTINCT replay_id) filter (WHERE winning_color != ''BLUE'') as orange_wins\n\t\tFROM game_stats g\n\t\tINNER JOIN vars v on v.scrim_id=g.scrim_id\n\t\tGROUP BY v.scrim_id\n\t)\n\tSELECT \ts.league,\n\t\t\ts.mode,\n\t\t\tsc.type,\n\t\t\tss.blue_wins,\n\t\t\tss.orange_wins,\n\t\t\tconcat(ss.blue_wins, '' - '', ss.orange_wins) as series_score\n\tFROM \t\tvars v\n\tINNER JOIN \tmledb.scrim sc\n\tON \t\t\tv.scrim_id = sc.id\n\tINNER JOIN \tmledb.series s\n\tON \t\t\tv.scrim_id = s.scrim_id\n\tINNER JOIN \tseries_score ss\n\tON\t\t\tss.scrim_id = v.scrim_id\n),\ngame_object AS(\n\tSELECT\n\t\tjsonb_build_object(''type'', ''text'', ''value'', CONCAT(LEFT(gi.league,1), ''L '',\n\t\t\t\t\t\t  CASE\n\t\t\t\t\t\t  \tWHEN type = ''TEAMS'' AND mode=''STANDARD'' THEN ''3S TEAMS ''\n\t\t\t\t\t\t   \tWHEN type = ''TEAMS'' AND mode=''DOUBLES'' THEN ''2S TEAMS ''\n\t\t\t\t\t\t   \tWHEN type = ''ROUND_ROBIN'' AND mode=''STANDARD'' THEN ''3S ROUND ROBIN ''\n\t\t\t\t\t\t   \tWHEN type = ''ROUND_ROBIN'' AND mode=''DOUBLES'' THEN ''2S ROUND ROBIN ''\n\t\t\t\t\t\t\tWHEN mode=''SOLO'' THEN ''1S TEAMS ''\n\t\t\t\t\t\t  END\n\t\t\t\t\t\t  )) AS title,\n\t\tjsonb_build_object(''type'', ''text'', ''value'', CONCAT(UPPER(LEFT(mode, 1)),LOWER(SUBSTRING(mode, 2, LENGTH(mode))))) AS scrim_mode,\n\t\tjsonb_build_object(''type'', ''text'', ''value'',\n\t\t\t\t\t\t  CASE\n\t\t\t\t\t\t   \tWHEN type = ''TEAMS'' THEN ''Teams''\n\t\t\t\t\t\t   \tWHEN type = ''ROUND_ROBIN'' THEN ''Round Robin''\n\t\t\t\t\t\t  END) AS scrim_type,\n\t\tjsonb_build_object(''type'', ''text'', ''value'',\n\t\t\t\t\t\t  CASE\n\t\t\t\t\t\t   \tWHEN mode = ''STANDARD'' THEN ''3S''\n\t\t\t\t\t\t   \tWHEN mode = ''DOUBLES'' THEN ''2S''\n\t\t\t\t\t\t\tWHEN mode = ''SOLO'' THEN ''1S''\n\t\t\t\t\t\t  END ) AS mode_short,\n\t\tjsonb_build_object(''type'', ''text'', ''value'', CONCAT(UPPER(LEFT(gi.league, 1)),LOWER(SUBSTRING(gi.league, 2, LENGTH(gi.league))))) AS league,\n\t\tjsonb_build_object(''type'', ''text'', ''value'', CONCAT(LEFT(gi.league,1), ''L'')) as league_short,\n\t\tjsonb_build_object(''type'', ''color'', ''value'', lb.color) as league_color,\n\t\tjsonb_build_object(''type'', ''image'', ''value'', lb.badge_img_link) as league_logo,\n\t\tjsonb_build_object(''type'', ''color'', ''value'',\n\t\t\t\t\t\t  CASE\n\t\t\t\t\t\t  \tWHEN blue_wins > orange_wins THEN ''#0C2CFC''\n\t\t\t\t\t\t  \tELSE ''#FC7C0C''\n\t\t\t\t\t\t  END) as winning_color,\n\t\tjson_build_object(''type'', ''text'', ''value'', series_score) as series_score\n\n\n\tFROM game_info gi\n\tINNER JOIN mledb.league_branding lb\n\tON gi.league = lb.league\n),\n\nplayer_stats AS (\n\tWITH\n\trecords AS (\n\t\tSELECT \tCOUNT(CASE WHEN winning_color = player_team_color THEN 1 END) as wins,\n\t\t\t\tCOUNT(CASE WHEN winning_color != player_team_color THEN 1 END) as losses,\n\t\t\t\tplayer_name\n\t\tFROM game_stats\n\t\tGROUP BY player_name\n\t),\n\n\tt AS(\n\t\tSELECT \tgs.player_name AS name,\n\t\t\t\tre.wins,\n\t\t\t\tre.losses,\n\t\t\t\tAVG(COALESCE(gs.gpi, gs.mvpr)) AS rating,\n\t\t\t\tSUM(gs.goals) AS goals,\n\t\t\t\tSUM(gs.assists) AS assists,\n\t\t\t\tSUM(gs.saves) AS saves,\n\t\t\t\tSUM(gs.shots) AS shots,\n\t\t\t\tRANK() OVER(ORDER BY AVG(gs.mvpr) DESC) rank\n\t\tFROM game_stats gs\n\t\tINNER JOIN records re\n\t\tON gs.player_name = re.player_name\n\t\tGROUP BY gs.player_name, re.wins, re.losses\n\t\tORDER BY wins DESC, rating DESC\n\t)\n\tSELECT\n\t\tt.name,\n\t\tt.wins,\n\t\tt.losses,\n\t\tCONCAT(t.wins, '' - '', t.losses) AS record,\n\t\tROUND(CAST(t.rating AS numeric),2) AS rating,\n\t\tt.goals,\n\t\tt.saves,\n\t\tt.shots,\n\t\tt.assists,\n\t\tc.color as player_color\n\tFROM t\n\tINNER JOIN colors c\n\tON t.rank=c.number\n),\nplayer_stats_object AS(\n\tWITH\n\tblank_player_data_json AS (\n       SELECT\n\t\t\tjsonb_build_object(''type'', ''text'', ''value'', '''') AS name,\n\t\t\tjsonb_build_object(''type'', ''number'', ''value'', '''') AS wins,\n\t\t\tjsonb_build_object(''type'', ''number'', ''value'', '''') AS losses,\n\t\t\tjsonb_build_object(''type'', ''text'', ''value'', '''') AS record,\n\t\t\tjsonb_build_object(''type'', ''number'', ''value'', '''') AS rating,\n\t\t\tjsonb_build_object(''type'', ''number'', ''value'', '''') AS goals,\n\t\t\tjsonb_build_object(''type'', ''number'', ''value'', '''') AS assists,\n\t\t\tjsonb_build_object(''type'', ''number'', ''value'', '''') AS saves,\n\t\t\tjsonb_build_object(''type'', ''number'', ''value'', '''') AS shots,\n\t\t\tjsonb_build_object(''type'', ''color'', ''value'', ''#FFFFFF00'') AS player_color,\n\t\t\tjsonb_build_object(''type'', ''color'', ''value'', ''#FFFFFF00'') AS team_color\n       FROM   (VALUES (''''), (''''), (''''), (''''), (''''), (''''), (''''), ('''')) a\n\t),\n\tplayer_data_json AS(\n\t\tSELECT\n\t\t\tjsonb_build_object(''type'', ''text'', ''value'', name) AS name,\n\t\t\tjsonb_build_object(''type'', ''number'', ''value'', wins) AS wins,\n\t\t\tjsonb_build_object(''type'', ''number'', ''value'', losses) AS losses,\n\t\t\tjsonb_build_object(''type'', ''text'', ''value'', record) AS record,\n\t\t\tjsonb_build_object(''type'', ''number'', ''value'', rating) AS rating,\n\t\t\tjsonb_build_object(''type'', ''number'', ''value'', goals) AS goals,\n\t\t\tjsonb_build_object(''type'', ''number'', ''value'', assists) AS assists,\n\t\t\tjsonb_build_object(''type'', ''number'', ''value'', saves) AS saves,\n\t\t\tjsonb_build_object(''type'', ''number'', ''value'', shots) AS shots,\n\t\t\tjsonb_build_object(''type'', ''color'', ''value'', player_color) AS player_color,\n\t\t\tjsonb_build_object(''type'', ''color'', ''value'',\n\t\t\t\t\t\t CASE\n\t\t\t\t\t\t\t\tWHEN player_color = ''BLUE'' THEN ''#0C2CFC''\n\t\t\t\t\t\t\t\tWHEN player_color = ''ORANGE'' THEN ''#FC7C0C''\n\t\t\t\t\t\t\t\tELSE ''#FFFFFF00''\n\t\t\t\t\t\t END\n\t\t   )                                                     AS team_color\n\t\tFROM player_stats\n\t)\n\tSELECT * from player_data_json\n\tUNION ALL\n   \tSELECT   *\n   \tFROM     blank_player_data_json\n\tLIMIT 6\n\n),\n\ngames_data AS(\n\tWITH\n\tempty_player_game_data AS(\n\t\tSELECT \tgs.replay_id,\n\t\t\t\tgs.winning_color,\n\t\t\t\tgs.player_team_color,\n\t\t\t\t-1,\n\t\t\t\t0,\n\t\t\t\tjsonb_build_object(''type'', ''text'', ''value'', '''') as player,\n\t\t\t\tjsonb_build_object(''type'', ''color'', ''value'', ''#FFFFFF00'') as team_color,\n\t\t\t\tjsonb_build_object(''type'', ''color'', ''value'', ''FFFFFF00'') as player_color,\n\t\t\t\tjsonb_build_object(''type'', ''number'', ''value'', '''') as p_rating,\n\t\t\t\tjsonb_build_object(''type'', ''number'', ''value'', '''') as p_score,\n\t\t\t\tjsonb_build_object(''type'', ''number'', ''value'', '''') as p_goals,\n\t\t\t\tjsonb_build_object(''type'', ''number'', ''value'', '''') as p_assists,\n\t\t\t\tjsonb_build_object(''type'', ''number'', ''value'', '''') as p_saves,\n\t\t\t\tjsonb_build_object(''type'', ''number'', ''value'', '''') as p_shots\n\t\tfrom game_stats gs\n\t\tJOIN player_stats ps ON gs.player_name = ps.name\n\t\tORDER BY gs.replay_id, gs.player_team_color\n\n\t),\n\tplayer_game_data AS(\n\t\tSELECT  gs.replay_id,\n\t\t\t\tgs.winning_color,\n\t\t\t\tgs.player_team_color,\n\t\t\t\tgs.score,\n\t\t\t\tgs.goals,\n\t\t\t\tjsonb_build_object(''type'', ''text'', ''value'', gs.player_name) as player,\n\t\t\t\tjsonb_build_object(''type'', ''color'', ''value'',\n\t\t\t\t\t\t\t\tCASE\n\t\t\t\t\t\t\t\t\tWHEN gs.player_team_color = ''BLUE'' THEN ''#0C2CFC''\n\t\t\t\t\t\t\t\t\tWHEN gs.player_team_color = ''ORANGE'' THEN ''#FC7C0C''\n\t\t\t\t\t\t\t\tELSE ''#FFFFFF00''\n\t\t\t\t\t\t\t\tEND\n\n\t\t\t\t\t\t\t\t  ) as team_color,\n\t\t\t\tjsonb_build_object(''type'', ''color'', ''value'', ps.player_color) as player_color,\n\t\t\t\tjsonb_build_object(''type'', ''number'', ''value'', gs.mvpr) as p_rating,\n\t\t\t\tjsonb_build_object(''type'', ''number'', ''value'', gs.score) as p_score,\n\t\t\t\tjsonb_build_object(''type'', ''number'', ''value'', gs.goals) as p_goals,\n\t\t\t\tjsonb_build_object(''type'', ''number'', ''value'', gs.assists) as p_assists,\n\t\t\t\tjsonb_build_object(''type'', ''number'', ''value'', gs.saves) as p_saves,\n\t\t\t\tjsonb_build_object(''type'', ''number'', ''value'', gs.shots) as p_shots\n\n\t\tfrom game_stats gs\n\t\tJOIN player_stats ps ON gs.player_name = ps.name\n\t\tUNION ALL\n\t\tSELECT * from empty_player_game_data\n\t),\n\tcomplete_player_data AS(\n\t\tSELECT *,\n\t\tROW_NUMBER() OVER (PARTITION BY cpd.replay_id, cpd.player_team_color ORDER BY cpd.score DESC) AS n\n\t\tFROM player_game_data cpd\n\t\tORDER BY replay_id, player_team_color DESC, player->>''value'' DESC\n\t),\n\tteam_replay_data AS(\n\t\tSELECT\n\t\t\treplay_id,\n\t\t\twinning_color,\n\t\t\tSUM(goals) filter (WHERE player_team_color = ''BLUE'') as blue_goals,\n\t\t\tSUM(goals) filter (WHERE player_team_color = ''ORANGE'') as orange_goals,\n\t\t\tjson_agg(jsonb_build_object(\n\t\t\t\t''name'', player,\n\t\t\t\t''player_color'', player_color,\n\t\t\t\t''team_color'',team_color,\n\t\t\t\t''rating'', p_rating,\n\t\t\t\t''score'', p_score,\n\t\t\t\t''goals'', p_goals,\n\t\t\t\t''assists'', p_assists,\n\t\t\t\t''saves'', p_saves,\n\t\t\t\t''shots'', p_shots\n\t\t\t)) filter (WHERE player_team_color = ''BLUE'') AS blue_players,\n\t\t\tjson_agg(jsonb_build_object(\n\t\t\t\t''name'', player,\n\t\t\t\t''player_color'', player_color,\n\t\t\t\t''team_color'',team_color,\n\t\t\t\t''rating'', p_rating,\n\t\t\t\t''score'', p_score,\n\t\t\t\t''goals'', p_goals,\n\t\t\t\t''assists'', p_assists,\n\t\t\t\t''saves'', p_saves,\n\t\t\t\t''shots'', p_shots\n\t\t\t)) filter (WHERE player_team_color = ''ORANGE'') AS orange_players\n\t\tFROM complete_player_data WHERE n < 4\n\t\tGROUP BY replay_id, winning_color\n\t),\n\tplayed_game_data AS(\n\t\tSELECT\n\t\t\tjsonb_build_object(''type'', ''text'', ''value'', CONCAT(blue_goals, '' - '',orange_goals)) as result,\n\t\t\tjsonb_build_object(''type'', ''color'', ''value'',\n\t\t\t\t\t\t\t CASE\n\t\t\t\t\t\t\t\tWHEN winning_color = ''BLUE'' THEN ''#0C2CFC''\n\t\t\t\t\t\t\t\tWHEN winning_color = ''ORANGE'' THEN ''#FC7C0C''\n\t\t\t\t\t\t\t\tELSE ''''\n\t\t\t\t\t\t\t  END\n\t\t\t\t\t\t\t ) winning_color,\n\t\t\tjsonb_build_object(''type'',''number'',''value'',blue_goals) AS blue_goals,\n\t\t\tjsonb_build_object(''type'',''number'',''value'',orange_goals) AS orange_goals,\n\t\t\tblue_players,\n\t\t\torange_players\n\t\tFROM team_replay_data\n\t),\n\tempty_game_data AS (\n\t\tWITH empty_players AS(\n\t\t\tSELECT 1 as n, jsonb_build_object(\n\t\t\t\t\t\t\t\t\t\t''name'', json_build_object(''type'', ''text'', ''value'', ''''),\n\t\t\t\t\t\t\t\t\t\t''player_color'', json_build_object(''type'', ''color'', ''value'', ''#FFFFFF00''),\n\t\t\t\t\t\t\t\t\t\t''team_color'',json_build_object(''type'', ''color'', ''value'', ''FFFFFF00''),\n\t\t\t\t\t\t\t\t\t\t''rating'', json_build_object(''type'', ''number'', ''value'', ''''),\n\t\t\t\t\t\t\t\t\t\t''score'', json_build_object(''type'', ''number'', ''value'', ''''),\n\t\t\t\t\t\t\t\t\t\t''goals'', json_build_object(''type'', ''number'', ''value'', ''''),\n\t\t\t\t\t\t\t\t\t\t''assists'', json_build_object(''type'', ''number'', ''value'', ''''),\n\t\t\t\t\t\t\t\t\t\t''saves'', json_build_object(''type'', ''number'', ''value'', ''''),\n\t\t\t\t\t\t\t\t\t\t''shots'', json_build_object(''type'', ''number'', ''value'', '''')\n\t\t\t\t\t\t\t\t\t ) as ep\n\t\t\tFROM (VALUES\n\t\t\t\t('''', ''''),\n\t\t\t\t('''',''''),\n\t\t\t\t('''', '''')\n\t\t\t) a\n\t\t)\n\t\tSELECT json_build_object(''result'', jsonb_build_object(''type'', ''text'', ''value'', ''''),\n\t\t\t\t\t\t\t\t ''winning_color'', jsonb_build_object(''type'', ''color'', ''value'', ''#FFFFFF00''),\n\t\t\t\t\t\t\t\t ''blue_goals'',  jsonb_build_object(''type'', ''number'', ''value'', ''''),\n\t\t\t\t\t\t\t\t  ''orange_goals'', jsonb_build_object(''type'', ''number'', ''value'', ''''),\n\t\t\t\t\t\t\t\t  ''blue_players'', json_agg(e.ep),\n\t\t\t\t\t\t\t\t  ''orange_players'', json_agg(e.ep)\n\t\t\t\t\t\t\t\t )\n\t\tFROM empty_players e\n\t\tGROUP BY n\n\t)\n\tSELECT row_to_json(played_game_data.*) as game\n\tFROM played_game_data\n\tUNION ALL\n\tSELECT * FROM empty_game_data\n\tUNION ALL\n\tSELECT * FROM empty_game_data\n\tUNION ALL\n\tSELECT * FROM empty_game_data\n\tUNION ALL\n\tSELECT * FROM empty_game_data\n\tLIMIT 7\n\n),\n\nfull_object AS (\n\tSELECT\n\t\t(SELECT row_to_json(organization.*) FROM organization) AS organization,\n\t\t(SELECT row_to_json(game_object.*) FROM game_object) AS game,\n\t\t(SELECT json_agg(player_stats_object.*) FROM player_stats_object) as player_data,\n\t\t(SELECT json_agg(games_data.game) FROM games_data) as games_data\n\tFROM game_object\n)\n\nSELECT row_to_json(full_object.*) AS data FROM full_object\n",
  "filters": [
    {
      "code": "scrim_id",
      "name": "Scrim",
      "query": "SELECT CONCAT( DATE_TRUNC(''minute'', s.created_at), '' '', LEFT(se.league, 1), ''L '', REPLACE(INITCAP(se.mode), ''_'', '' ''), '' '', REPLACE(INITCAP(type), ''_'', '' ''), '' '') AS Description, s.ID AS Value FROM mledb.scrim s INNER JOIN mledb.series se ON s.id = se.scrim_id ORDER BY s.ID DESC",
      "description": "ScrimID"
    },
    {
      "code": "org_id",
      "name": "Organization",
      "query": "SELECT id as value, description FROM sprocket.organization_profile",
      "description": "Organization"
    }
  ]
}')
