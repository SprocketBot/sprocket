import os
import sys
import unittest
from types import ModuleType
from pathlib import Path
from unittest.mock import patch


SERVICE_ROOT = Path(__file__).resolve().parents[1]
SRC_ROOT = SERVICE_ROOT / "src"

os.environ.setdefault("CONFIG_DIR", str(SERVICE_ROOT / "config"))
os.environ.setdefault("ENV", "default")
os.chdir(SRC_ROOT)
sys.path.insert(0, str(SRC_ROOT))

if "carball" not in sys.modules:
    sys.modules["carball"] = ModuleType("carball")

if "ballchasing" not in sys.modules:
    ballchasing = ModuleType("ballchasing")

    class _Api:
        def __init__(self, *args, **kwargs):
            pass

    ballchasing.Api = _Api
    sys.modules["ballchasing"] = ballchasing

if "requests" not in sys.modules:
    requests = ModuleType("requests")

    class _Response:
        pass

    requests.Response = _Response
    sys.modules["requests"] = requests

import parser as replay_parser  # noqa: E402


class ParserIdNormalizationTests(unittest.TestCase):
    def test_prefers_epic_account_id_when_online_id_is_placeholder(self):
        raw_player = {
            "OnlineID": "0",
            "PlayerID": {
                "fields": {
                    "EpicAccountId": "662690e031794644ba858574826f82ff",
                    "Uid": "0",
                },
            },
        }

        result = replay_parser._extract_player_platform_account_id(
            raw_player,
            "OnlinePlatform_Epic",
        )

        self.assertEqual(result, "662690e031794644ba858574826f82ff")

    def test_falls_back_to_uid_for_non_epic_accounts(self):
        raw_player = {
            "OnlineID": None,
            "PlayerID": {
                "fields": {
                    "Uid": "1234567890",
                },
            },
        }

        result = replay_parser._extract_player_platform_account_id(
            raw_player,
            "OnlinePlatform_Steam",
        )

        self.assertEqual(result, "1234567890")

    def test_uses_psn_handle_when_available(self):
        raw_player = {
            "OnlineID": "0",
            "PlayerID": {
                "fields": {
                    "NpId": {
                        "fields": {
                            "Handle": {
                                "fields": {
                                    "Data": "PlayerHandle",
                                },
                            },
                        },
                    },
                },
            },
        }

        result = replay_parser._extract_player_platform_account_id(
            raw_player,
            "OnlinePlatform_PS4",
        )

        self.assertEqual(result, "PlayerHandle")

    def test_parse_uses_carball_full_analysis_when_configured(self):
        with patch.object(replay_parser, "PARSER", "carball"), \
                patch.object(replay_parser, "_parse_carball_full_analysis", return_value={"mode": "full"}) as parse_full, \
                patch.object(replay_parser, "_parse_ballchasing") as parse_ballchasing, \
                patch.object(replay_parser, "_parse_dual_with_shadow") as parse_shadow:
            result = replay_parser.parse("/tmp/example.replay")

        self.assertEqual(result, {"mode": "full"})
        parse_full.assert_called_once_with("/tmp/example.replay", None)
        parse_ballchasing.assert_not_called()
        parse_shadow.assert_not_called()

    def test_parse_uses_ballchasing_shadow_primary_when_configured(self):
        with patch.object(replay_parser, "PARSER", "ballchasing-with-carball-shadow"), \
                patch.object(replay_parser, "_parse_dual_with_shadow", return_value={"mode": "shadow"}) as parse_shadow, \
                patch.object(replay_parser, "_parse_carball_full_analysis") as parse_full, \
                patch.object(replay_parser, "_parse_ballchasing") as parse_ballchasing:
            result = replay_parser.parse("/tmp/example.replay")

        self.assertEqual(result, {"mode": "shadow"})
        parse_shadow.assert_called_once_with("/tmp/example.replay", None)
        parse_full.assert_not_called()
        parse_ballchasing.assert_not_called()

    def test_result_metadata_matches_carball_full_analysis_mode(self):
        with patch.object(replay_parser, "PARSER", "carball"):
            self.assertEqual(
                replay_parser.get_result_metadata(),
                {
                    "parser": "carball",
                    "analysisMode": "full-analysis",
                },
            )

    def test_result_metadata_maps_shadow_mode_to_ballchasing(self):
        with patch.object(replay_parser, "PARSER", "ballchasing-with-carball-shadow"):
            self.assertEqual(
                replay_parser.get_result_metadata(),
                {
                    "parser": "ballchasing",
                    "analysisMode": "full-analysis",
                },
            )


if __name__ == "__main__":
    unittest.main()
