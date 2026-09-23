import carball
import json
import logging
import re

from carball.analysis.analysis_manager import AnalysisManager
from carball.json_parser.game import Game
from carball.json_parser.player import Player
from datetime import datetime
from typing import Callable, Iterable, List, Optional, Tuple


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


def _player_id_key(value) -> Optional[str]:
    online_id = _canonical_online_id(value)
    if online_id is None:
        return None
    return online_id.lower()


# Rocket League sometimes writes a phantom PlayerStats row whose Name is the
# UniqueId encoding Platform|<accountId>|<localId>, Team is -1, and Score is 0.
# It duplicates a real player and has no matching PRI, so it stays
# id_source=player_stats and AnalysisManager rejects the replay.
_ENCODED_UNIQUE_ID_PLAYER_NAME = re.compile(
    r"^(Epic|Steam|PlayStation|PS4|PSN|Xbox|XBox|Dingo|PsyNet|NNX|"
    r"Switch|NintendoSwitch|QQ|WeGame)\|([^|]+)\|(\d+)$",
    re.IGNORECASE,
)
_MISSING = object()


def _account_id_from_encoded_player_name(name) -> Optional[str]:
    match = _ENCODED_UNIQUE_ID_PLAYER_NAME.match(name or "")
    if not match:
        return None
    return match.group(2).lower()


def _player_stats_account_id(player_stats: dict) -> Optional[str]:
    platform = _normalize_player_platform(player_stats.get("Platform"))
    account_id = _canonical_online_id(
        _extract_player_platform_account_id(player_stats, platform)
    )
    if account_id is not None:
        return account_id.lower()
    return _account_id_from_encoded_player_name(player_stats.get("Name"))


def _is_unassigned_player_stats_row(player_stats: dict) -> bool:
    return player_stats.get("Team") in (-1, None) and player_stats.get("Score") in (
        0,
        None,
    )


def _filter_ghost_player_stats(
    player_stats: Iterable,
) -> Tuple[List[dict], int]:
    rows = [row for row in player_stats or [] if isinstance(row, dict)]
    real_account_ids = set()
    for row in rows:
        encoded_id = _account_id_from_encoded_player_name(row.get("Name"))
        if encoded_id and _is_unassigned_player_stats_row(row):
            continue
        account_id = _player_stats_account_id(row)
        if account_id:
            real_account_ids.add(account_id)

    kept = []
    dropped = 0
    for row in rows:
        encoded_id = _account_id_from_encoded_player_name(row.get("Name"))
        if (
            encoded_id
            and _is_unassigned_player_stats_row(row)
            and encoded_id in real_account_ids
        ):
            logging.warning(
                "Dropping ghost PlayerStats row: name=%s team=%s score=%s account=%s",
                row.get("Name"),
                row.get("Team"),
                row.get("Score"),
                encoded_id,
            )
            dropped += 1
            continue
        kept.append(row)
    return kept, dropped


def _is_header_only_orphan(player) -> bool:
    """True for a PlayerStats-only leaver/spectator that never got a PRI.

    These rows survive UniqueId association because there is no actor to join.
    AnalysisManager then rejects the replay. Players created from actors, bots,
    and header players that actually played (Team 0/1) are left alone.
    """
    if getattr(player, "is_bot", False):
        return False
    if getattr(player, "id_source", None) == "unique_id":
        return False
    if getattr(player, "data", None) is not None:
        return False
    header_team = getattr(player, "_header_team", _MISSING)
    if header_team is _MISSING or header_team not in (-1, None):
        return False
    if getattr(player, "score", None) not in (0, None):
        return False
    return True


def _drop_header_only_orphan_players(game) -> int:
    players = list(getattr(game, "players", None) or [])
    kept = []
    dropped = 0
    for player in players:
        if _is_header_only_orphan(player):
            logging.warning(
                "Dropping header-only PlayerStats orphan: name=%s team=%s score=%s "
                "id_source=%s online_id=%s",
                getattr(player, "name", None),
                getattr(player, "_header_team", None),
                getattr(player, "score", None),
                getattr(player, "id_source", None),
                getattr(player, "online_id", None),
            )
            dropped += 1
            continue
        kept.append(player)

    if not dropped:
        return 0

    game.players = kept
    kept_ids = {id(player) for player in kept}
    for team in getattr(game, "teams", None) or []:
        team_players = getattr(team, "players", None)
        if not team_players:
            continue
        if isinstance(team_players, set):
            team.players = {player for player in team_players if id(player) in kept_ids}
        else:
            team.players = [player for player in team_players if id(player) in kept_ids]
    return dropped


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
        online_id = _player_id_key(getattr(player, "online_id", None))
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
        unique_id = _player_id_key(unique_id)
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
    def create_players(self):
        properties = self.properties or {}
        raw_stats = properties.get("PlayerStats")
        if raw_stats:
            filtered, dropped = _filter_ghost_player_stats(raw_stats)
            if dropped:
                properties["PlayerStats"] = filtered
                raw_stats = filtered

        players = []
        for player_stats in raw_stats or []:
            if not isinstance(player_stats, dict):
                continue
            try:
                player = Player().parse_player_stats(player_stats)
            except KeyError as exc:
                logging.warning(
                    "Skipping malformed PlayerStats row name=%s: %s",
                    player_stats.get("Name"),
                    exc,
                )
                continue
            player._header_team = player_stats.get("Team")
            players.append(player)
        return players

    def parse_all_data(self, all_data, clean_player_names):
        _associate_actors_with_player_stats_by_unique_id(
            self.players, all_data, goals=self.goals
        )
        result = super().parse_all_data(all_data, clean_player_names)
        _drop_header_only_orphan_players(self)
        return result


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
