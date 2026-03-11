import os
import sys
import unittest
from pathlib import Path


SERVICE_ROOT = Path(__file__).resolve().parents[1]
SRC_ROOT = SERVICE_ROOT / "src"

os.environ.setdefault("CONFIG_DIR", str(SERVICE_ROOT / "config"))
os.environ.setdefault("ENV", "default")
os.chdir(SRC_ROOT)
sys.path.insert(0, str(SRC_ROOT))

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


if __name__ == "__main__":
    unittest.main()
