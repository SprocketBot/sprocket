"""
Regression tests for ballchasing HTTPError handling in parser._parse_ballchasing.

The python-ballchasing library raises requests.HTTPError via
Response.raise_for_status(). The exception's .args is a 1-tuple (message,) but
the parser previously assumed it was a 2-tuple (response, body) and crashed
with `IndexError: tuple index out of range` on every duplicate-replay 409.
"""

import os
import sys
import unittest
from types import ModuleType
from pathlib import Path
from unittest.mock import MagicMock, patch


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


def _make_http_error(status_code, body):
    """Build an exception matching what requests.HTTPError looks like:
    args = (message,), .response is the Response."""
    response = MagicMock()
    response.status_code = status_code
    response.json.return_value = body
    exc = Exception(f"{status_code} Client Error")
    exc.response = response
    return exc


class BallchasingDuplicateReplayHandlingTests(unittest.TestCase):
    def test_duplicate_replay_409_takes_fast_path_without_indexerror(self):
        """409 + body {error: 'duplicate replay', id: ...} should short-circuit
        the upload loop and proceed to fetch the existing replay's stats."""
        api = MagicMock()
        api.upload_replay.side_effect = _make_http_error(
            409, {"error": "duplicate replay", "id": "existing-replay-id"}
        )
        api.get_replay.return_value = {"status": "ok", "id": "existing-replay-id"}

        on_progress = MagicMock()

        with patch.object(replay_parser, "get_ballchasing_api", return_value=api), \
                patch.object(replay_parser, "DELAYS", [0]), \
                patch.object(replay_parser, "MAX_RETRIES", 1), \
                patch.object(replay_parser, "sleep"):
            replay_path = str(SERVICE_ROOT / "17A7C1084017DFA7DBE66D9C66D81CBD.replay")
            result = replay_parser._parse_ballchasing(replay_path, on_progress)

        self.assertEqual(result, {"status": "ok", "id": "existing-replay-id"})
        api.upload_replay.assert_called_once()
        api.get_replay.assert_called_once_with("existing-replay-id")

    def test_failed_replay_400_reraises_without_indexerror(self):
        """400 (failed replay) should re-raise the original exception,
        not crash with IndexError."""
        api = MagicMock()
        original_exc = _make_http_error(400, {"error": "bad replay"})
        api.upload_replay.side_effect = original_exc

        on_progress = MagicMock()

        with patch.object(replay_parser, "get_ballchasing_api", return_value=api), \
                patch.object(replay_parser, "DELAYS", [0, 1]), \
                patch.object(replay_parser, "MAX_RETRIES", 2), \
                patch.object(replay_parser, "sleep"):
            replay_path = str(SERVICE_ROOT / "17A7C1084017DFA7DBE66D9C66D81CBD.replay")
            with self.assertRaises(Exception) as cm:
                replay_parser._parse_ballchasing(replay_path, on_progress)

        # Must be the original 400, not an IndexError
        self.assertNotIsInstance(cm.exception, IndexError)
        self.assertIs(cm.exception, original_exc)

    def test_unknown_exception_without_response_is_reraised(self):
        """Exceptions with no .response (e.g. ConnectionError) should propagate
        unchanged rather than be silently misinterpreted as a known status."""
        api = MagicMock()
        api.upload_replay.side_effect = ConnectionError("network is down")

        on_progress = MagicMock()

        with patch.object(replay_parser, "get_ballchasing_api", return_value=api), \
                patch.object(replay_parser, "DELAYS", [0]), \
                patch.object(replay_parser, "MAX_RETRIES", 1), \
                patch.object(replay_parser, "sleep"):
            replay_path = str(SERVICE_ROOT / "17A7C1084017DFA7DBE66D9C66D81CBD.replay")
            with self.assertRaises(ConnectionError):
                replay_parser._parse_ballchasing(replay_path, on_progress)

    def test_get_replay_rate_limit_429_retries_without_indexerror(self):
        """429 from get_replay should be detected as rate limit and trigger
        a retry rather than crashing with IndexError."""
        api = MagicMock()
        api.upload_replay.return_value = {"id": "fresh-id"}
        api.get_replay.side_effect = [
            _make_http_error(429, {}),
            {"status": "ok", "id": "fresh-id"},
        ]

        on_progress = MagicMock()

        with patch.object(replay_parser, "get_ballchasing_api", return_value=api), \
                patch.object(replay_parser, "DELAYS", [0, 1]), \
                patch.object(replay_parser, "MAX_RETRIES", 2), \
                patch.object(replay_parser, "sleep"):
            replay_path = str(SERVICE_ROOT / "17A7C1084017DFA7DBE66D9C66D81CBD.replay")
            result = replay_parser._parse_ballchasing(replay_path, on_progress)

        self.assertEqual(result["status"], "ok")
        self.assertEqual(api.get_replay.call_count, 2)


if __name__ == "__main__":
    unittest.main()
