import carball
import json
import logging

from carball.analysis.analysis_manager import AnalysisManager
from carball.json_parser.game import Game
from carball.json_parser.player import Player
from datetime import datetime
from typing import Callable, Iterable


def get_result_metadata() -> dict:
    return {
        "parser": "carball",
        "analysisMode": "full-analysis",
    }


def parse(path: str, on_progress: Callable[[str], None] = None):
    return _parse_carball_full_analysis(path, on_progress)


def _normalize_player_platform(platform):
    if isinstance(platform, dict):
        platform = platform.get("value") or platform.get("Value")
    if platform is None:
        return None
    return str(platform)


def _get_nested_dict_value(data, *keys):
    current = data
    for key in keys:
        if not isinstance(current, dict):
            return None
        current = current.get(key)
    return current


def _normalize_platform_account_id(value):
    if isinstance(value, dict):
        normalized = (
            value.get("online_id")
            or value.get("value")
            or _get_nested_dict_value(value, "fields", "Data")
            or next(iter(value.values()), None)
        )
        return _normalize_platform_account_id(normalized)

    if value is None:
        return None

    normalized = str(value).strip()
    if normalized == "" or normalized == "0":
        return None
    return normalized


def _extract_player_platform_account_id(raw_player, platform):
    player_id_fields = _get_nested_dict_value(raw_player, "PlayerID", "fields") or {}
    platform_lower = (platform or "").lower()

    candidates = []
    if "epic" in platform_lower:
        candidates.extend(
            [
                player_id_fields.get("EpicAccountId"),
                raw_player.get("OnlineID"),
                player_id_fields.get("Uid"),
            ]
        )
    elif "ps" in platform_lower:
        candidates.extend(
            [
                _get_nested_dict_value(
                    player_id_fields, "NpId", "fields", "Handle", "fields", "Data"
                ),
                raw_player.get("OnlineID"),
                player_id_fields.get("Uid"),
            ]
        )
    else:
        candidates.extend(
            [
                raw_player.get("OnlineID"),
                player_id_fields.get("Uid"),
                player_id_fields.get("EpicAccountId"),
            ]
        )

    for candidate in candidates:
        normalized = _normalize_platform_account_id(candidate)
        if normalized is not None:
            return normalized

    return "0"


def _normalize_header_date(date_value):
    if date_value is None:
        return None

    for date_format in ["%Y-%m-%d %H-%M-%S", "%Y-%m-%d:%H-%M"]:
        try:
            return datetime.strptime(date_value, date_format).isoformat()
        except (TypeError, ValueError):
            continue
    return str(date_value)


def _canonical_online_id(value):
    if value in (None, "", "0", 0):
        return None
    text = str(value)
    if text.strip("0") == "":
        return None
    return text


def _associate_actors_with_player_stats_by_unique_id(
    players: Iterable, all_data: dict, goals: Iterable = None
) -> int:
    """Join PRI actors to header players by UniqueId when names differ.

    Carball only associates actors with PlayerStats by exact name. Production
    replays can disagree on that string for any platform: censored PRI names,
    punctuation differences, wholly different aliases, and similar mismatches.
    UniqueId is the authoritative join key. Restoring the PlayerStats name onto
    the matching actor lets the existing UniqueId upgrade path run with honest
    unique_id provenance.
    """
    player_dicts = all_data.get("player_dicts") or {}
    if not player_dicts:
        return 0

    players_by_online_id = {}
    for player in players:
        online_id = _canonical_online_id(getattr(player, "online_id", None))
        if online_id is None:
            continue
        players_by_online_id.setdefault(online_id, player)

    probe = Player()
    restored = 0
    for player_data in player_dicts.values():
        if not isinstance(player_data, dict):
            continue
        if "Engine.PlayerReplicationInfo:UniqueId" not in player_data:
            continue
        unique_id, _platform = probe._get_unique_id_and_platform_from_actor(player_data)
        unique_id = _canonical_online_id(unique_id)
        if unique_id is None:
            continue
        matched = players_by_online_id.get(unique_id)
        if matched is None or not getattr(matched, "name", None):
            continue
        old_name = player_data.get("name")
        if old_name != matched.name:
            player_data["name"] = matched.name
            for goal in goals or []:
                if getattr(goal, "player_name", None) == old_name:
                    goal.player_name = matched.name
                    if getattr(goal, "player", None) is None:
                        goal.player = matched
            restored += 1
    return restored


class _CarballGame(Game):
    def parse_all_data(self, all_data, clean_player_names):
        _associate_actors_with_player_stats_by_unique_id(
            self.players, all_data, goals=self.goals
        )
        return super().parse_all_data(all_data, clean_player_names)


def _parse_carball_full_analysis(
    path: str, on_progress: Callable[[str], None] = None
) -> dict:
    """
    Parses a Rocket League replay located at a given local path using carball

    Args:
        path (str): The local path of the replay file to parse
        on_progress (Callable[[str], None], optional): Callback for progress updates

    Returns:
        dict: A dictionary containing all of the stats returned by carball

    Raises:
        Exception: If replay decompilation or analysis fails
    """
    print(f"Parsing {path} with carball")

    try:
        # Step 1: Decompile the replay file to JSON
        if on_progress:
            on_progress("Decompiling replay...")
        _json = carball.decompile_replay(path)

        # Step 2: Initialize Game object with decompiled JSON
        if on_progress:
            on_progress("Initializing game data...")
        game = _CarballGame()
        game.initialize(loaded_json=_json)

        # Step 3: Create analysis and extract statistics
        if on_progress:
            on_progress("Analyzing replay...")
        analysis_manager = AnalysisManager(game)
        analysis_manager.create_analysis()

        output = analysis_manager.get_json_data()
        print(f"Carball output: {json.dumps(output)}")
        return output
    except Exception as e:
        logging.error(f"Carball parsing failed for {path}: {str(e)}")
        error_message = str(e)
        if "network_frames" in error_message:
            error_message = (
                f"{error_message}. Full analysis requires parsed network frames. "
                "Use carball.summarize_replay_file(...) for metadata-only flows."
            )
        raise Exception(f"Failed to parse replay with carball: {error_message}")
