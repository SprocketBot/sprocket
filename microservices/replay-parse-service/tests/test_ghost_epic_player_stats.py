import os
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace


SERVICE_ROOT = Path(__file__).resolve().parents[1]
SRC_ROOT = SERVICE_ROOT / "src"

os.environ.setdefault("CONFIG_DIR", str(SERVICE_ROOT / "config"))
os.environ.setdefault("ENV", "default")
os.chdir(SRC_ROOT)
sys.path.insert(0, str(SRC_ROOT))

import parser as replay_parser  # noqa: E402


EPIC_ACCOUNT = "f93d75afd795466397f09a0ebe63f791"
OTHER_EPIC = "11f1fec3ea1b4a81afb65425193b4645"


def _epic_row(name, account_id, team=1, score=300):
    return {
        "Name": name,
        "Platform": {"kind": "OnlinePlatform", "value": "OnlinePlatform_Epic"},
        "OnlineID": "0",
        "Team": team,
        "Score": score,
        "bBot": False,
        "PlayerID": {
            "fields": {
                "EpicAccountId": account_id,
                "Uid": "0",
                "Platform": {"kind": "OnlinePlatform", "value": "OnlinePlatform_Epic"},
            }
        },
    }


def _steam_row(name, steam_id, team=0, score=500):
    return {
        "Name": name,
        "Platform": {"kind": "OnlinePlatform", "value": "OnlinePlatform_Steam"},
        "OnlineID": steam_id,
        "Team": team,
        "Score": score,
        "bBot": False,
        "PlayerID": {
            "fields": {
                "EpicAccountId": "",
                "Uid": steam_id,
                "Platform": {"kind": "OnlinePlatform", "value": "OnlinePlatform_Steam"},
            }
        },
    }


class GhostEpicPlayerStatsTests(unittest.TestCase):
    def test_drops_unassigned_encoded_duplicate_of_real_epic_player(self):
        rows = [
            _steam_row("kdot822", "76561198092528812"),
            _epic_row("noName Devotion", EPIC_ACCOUNT),
            _epic_row(
                f"Epic|{EPIC_ACCOUNT}|1",
                EPIC_ACCOUNT,
                team=-1,
                score=0,
            ),
            _epic_row("NachoCroutons", OTHER_EPIC),
        ]

        kept, dropped = replay_parser._filter_ghost_player_stats(rows)

        self.assertEqual(dropped, 1)
        self.assertEqual(
            [row["Name"] for row in kept],
            ["kdot822", "noName Devotion", "NachoCroutons"],
        )

    def test_keeps_encoded_name_when_player_actually_played(self):
        rows = [
            _epic_row("noName Devotion", EPIC_ACCOUNT),
            _epic_row(
                f"Epic|{EPIC_ACCOUNT}|1",
                EPIC_ACCOUNT,
                team=0,
                score=120,
            ),
        ]

        kept, dropped = replay_parser._filter_ghost_player_stats(rows)

        self.assertEqual(dropped, 0)
        self.assertEqual(len(kept), 2)

    def test_keeps_encoded_name_when_no_real_player_shares_the_account(self):
        rows = [
            _steam_row("kdot822", "76561198092528812"),
            _epic_row(
                f"Epic|{EPIC_ACCOUNT}|1",
                EPIC_ACCOUNT,
                team=-1,
                score=0,
            ),
        ]

        kept, dropped = replay_parser._filter_ghost_player_stats(rows)

        self.assertEqual(dropped, 0)
        self.assertEqual(len(kept), 2)

    def test_matches_encoded_account_id_case_insensitively(self):
        rows = [
            _epic_row("noName Devotion", EPIC_ACCOUNT.upper()),
            _epic_row(
                f"Epic|{EPIC_ACCOUNT}|1",
                EPIC_ACCOUNT,
                team=-1,
                score=0,
            ),
        ]

        kept, dropped = replay_parser._filter_ghost_player_stats(rows)

        self.assertEqual(dropped, 1)
        self.assertEqual([row["Name"] for row in kept], ["noName Devotion"])

    def test_drops_unassigned_encoded_duplicate_of_real_steam_player(self):
        steam_id = "76561198092528812"
        rows = [
            _steam_row("kdot822", steam_id),
            _steam_row(
                f"Steam|{steam_id}|1",
                steam_id,
                team=-1,
                score=0,
            ),
        ]

        kept, dropped = replay_parser._filter_ghost_player_stats(rows)

        self.assertEqual(dropped, 1)
        self.assertEqual([row["Name"] for row in kept], ["kdot822"])


class HeaderOnlyOrphanPlayerTests(unittest.TestCase):
    def test_drops_unassigned_header_player_that_never_got_a_pri(self):
        orphan = SimpleNamespace(
            name="bnjdot",
            online_id="9f14c4fa72bb43339b4297b8be21999f",
            id_source="player_stats",
            is_bot=False,
            score=0,
            data=None,
            _header_team=-1,
        )
        real = SimpleNamespace(
            name="Wiz",
            online_id="76561198970983905",
            id_source="unique_id",
            is_bot=False,
            score=211,
            data=object(),
            _header_team=0,
        )
        team = SimpleNamespace(players=[orphan, real])
        game = SimpleNamespace(players=[real, orphan], teams=[team])

        dropped = replay_parser._drop_header_only_orphan_players(game)

        self.assertEqual(dropped, 1)
        self.assertEqual(game.players, [real])
        self.assertEqual(team.players, [real])

    def test_keeps_assigned_header_player_missing_unique_id(self):
        missing = SimpleNamespace(
            name="YukigeshikiJP",
            online_id="a8bf050b00000900",
            id_source="player_stats",
            is_bot=False,
            score=120,
            data=None,
            _header_team=0,
        )
        game = SimpleNamespace(players=[missing], teams=[])

        dropped = replay_parser._drop_header_only_orphan_players(game)

        self.assertEqual(dropped, 0)
        self.assertEqual(game.players, [missing])

    def test_keeps_unassigned_player_that_matched_a_pri(self):
        leaver_with_pri = SimpleNamespace(
            name="Titan",
            online_id="76561198151563184",
            id_source="unique_id",
            is_bot=False,
            score=0,
            data=object(),
            _header_team=-1,
        )
        game = SimpleNamespace(players=[leaver_with_pri], teams=[])

        dropped = replay_parser._drop_header_only_orphan_players(game)

        self.assertEqual(dropped, 0)
        self.assertEqual(game.players, [leaver_with_pri])

    def test_keeps_actor_created_players_without_header_team(self):
        actor_player = SimpleNamespace(
            name="late joiner",
            online_id="76561198000000000",
            id_source="player_stats",
            is_bot=False,
            score=0,
            data=None,
        )
        game = SimpleNamespace(players=[actor_player], teams=[])

        dropped = replay_parser._drop_header_only_orphan_players(game)

        self.assertEqual(dropped, 0)
        self.assertEqual(game.players, [actor_player])


if __name__ == "__main__":
    unittest.main()
