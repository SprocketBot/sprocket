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


XBOX_XUID_DECIMAL = "2533274975322024"
XBOX_XUID_LE_HEX = int(XBOX_XUID_DECIMAL).to_bytes(8, "little").hex()


def _xbox_actor(name, unique_id=XBOX_XUID_DECIMAL):
    return {
        "name": name,
        "Engine.PlayerReplicationInfo:UniqueId": {
            "system_id": 4,
            "remote_id": {"Xbox": unique_id},
            "local_id": 0,
        },
    }


def _steam_actor(name, steam_id):
    return {
        "name": name,
        "Engine.PlayerReplicationInfo:UniqueId": {
            "system_id": 1,
            "remote_id": {"Steam": steam_id},
            "local_id": 0,
        },
    }


class UniqueIdActorAssociationTests(unittest.TestCase):
    def test_restores_header_name_when_pri_unique_id_matches_xbox_player(self):
        xbox_player = SimpleNamespace(
            name="RealGamertag",
            online_id=XBOX_XUID_LE_HEX,
            id_source="player_stats",
        )
        steam_player = SimpleNamespace(
            name="SteamPlayer",
            online_id="76561198018128432",
            id_source="unique_id",
        )
        xbox_actor = _xbox_actor("*************")
        steam_actor = _steam_actor("SteamPlayer", "76561198018128432")
        all_data = {
            "player_dicts": {
                15: xbox_actor,
                6: steam_actor,
            }
        }

        goal = SimpleNamespace(player_name="*************", player=None)
        restored = replay_parser._associate_actors_with_player_stats_by_unique_id(
            [xbox_player, steam_player],
            all_data,
            goals=[goal],
        )

        self.assertEqual(restored, 1)
        self.assertEqual(xbox_actor["name"], "RealGamertag")
        self.assertEqual(steam_actor["name"], "SteamPlayer")
        self.assertEqual(goal.player_name, "RealGamertag")
        self.assertIs(goal.player, xbox_player)
        self.assertEqual(xbox_player.id_source, "player_stats")
        self.assertEqual(xbox_player.online_id, XBOX_XUID_LE_HEX)

    def test_restores_header_name_when_pri_unique_id_matches_punctuation_mismatch(self):
        steam_id = "76561198905962946"
        header_player = SimpleNamespace(
            name="qck.",
            online_id=steam_id,
            id_source="player_stats",
        )
        other_player = SimpleNamespace(
            name="Chillax",
            online_id="76561198851704774",
            id_source="unique_id",
        )
        mismatched_actor = _steam_actor("qck", steam_id)
        matching_actor = _steam_actor("Chillax", "76561198851704774")
        all_data = {
            "player_dicts": {
                12: mismatched_actor,
                6: matching_actor,
            }
        }

        goal = SimpleNamespace(player_name="qck", player=None)
        restored = replay_parser._associate_actors_with_player_stats_by_unique_id(
            [header_player, other_player],
            all_data,
            goals=[goal],
        )

        self.assertEqual(restored, 1)
        self.assertEqual(mismatched_actor["name"], "qck.")
        self.assertEqual(matching_actor["name"], "Chillax")
        self.assertEqual(goal.player_name, "qck.")
        self.assertIs(goal.player, header_player)
        self.assertEqual(header_player.id_source, "player_stats")
        self.assertEqual(header_player.online_id, steam_id)

    def test_restores_header_name_when_pri_unique_id_matches_alias_mismatch(self):
        steam_id = "76561198398870404"
        header_player = SimpleNamespace(
            name="b!?",
            online_id=steam_id,
            id_source="player_stats",
        )
        other_player = SimpleNamespace(
            name="anjay21",
            online_id="76561198811338022",
            id_source="unique_id",
        )
        mismatched_actor = _steam_actor("brycen", steam_id)
        matching_actor = _steam_actor("anjay21", "76561198811338022")
        all_data = {
            "player_dicts": {
                12: mismatched_actor,
                6: matching_actor,
            }
        }

        goal = SimpleNamespace(player_name="brycen", player=None)
        restored = replay_parser._associate_actors_with_player_stats_by_unique_id(
            [header_player, other_player],
            all_data,
            goals=[goal],
        )

        self.assertEqual(restored, 1)
        self.assertEqual(mismatched_actor["name"], "b!?")
        self.assertEqual(matching_actor["name"], "anjay21")
        self.assertEqual(goal.player_name, "b!?")
        self.assertIs(goal.player, header_player)
        self.assertEqual(header_player.id_source, "player_stats")
        self.assertEqual(header_player.online_id, steam_id)

    def test_does_not_rename_when_unique_id_is_missing_or_zero(self):
        player = SimpleNamespace(
            name="RealGamertag",
            online_id=XBOX_XUID_LE_HEX,
            id_source="player_stats",
        )
        missing = {"name": "*************"}
        zeroed = _xbox_actor("*************", unique_id="0")
        all_data = {"player_dicts": {1: missing, 2: zeroed}}

        restored = replay_parser._associate_actors_with_player_stats_by_unique_id(
            [player],
            all_data,
        )

        self.assertEqual(restored, 0)
        self.assertEqual(missing["name"], "*************")
        self.assertEqual(zeroed["name"], "*************")
        self.assertEqual(player.id_source, "player_stats")

    def test_does_not_associate_unrelated_unique_ids(self):
        player = SimpleNamespace(
            name="RealGamertag",
            online_id=XBOX_XUID_LE_HEX,
            id_source="player_stats",
        )
        other = _xbox_actor("*************", unique_id="999")
        all_data = {"player_dicts": {15: other}}

        restored = replay_parser._associate_actors_with_player_stats_by_unique_id(
            [player],
            all_data,
        )

        self.assertEqual(restored, 0)
        self.assertEqual(other["name"], "*************")


if __name__ == "__main__":
    unittest.main()
