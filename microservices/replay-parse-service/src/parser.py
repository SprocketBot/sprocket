import logging
from time import sleep
from typing import Callable
import parser as carball
import ballchasing
from requests import Response

from config import config

BALLCHASING_TOKEN_FILE = open("../secret/ballchasing-token", "r")
BALLCHASING_TOKEN = BALLCHASING_TOKEN_FILE.read()
if len(BALLCHASING_TOKEN.strip()) == 0:
    print("Missing required secret: 'secret/ballchasing-token'`")
    exit(1)
BALLCHASING_TOKEN_FILE.close()

# We are handling rate limits, so the library doesn't need to
BALLCHASING_API = None

def get_ballchasing_api():
    global BALLCHASING_API
    if BALLCHASING_API is None:
        BALLCHASING_API = ballchasing.Api(BALLCHASING_TOKEN, sleep_time_on_rate_limit=0, print_on_rate_limit=False)
    return BALLCHASING_API

PARSER = config["parser"]
MAX_RETRIES = config["ballchasing"]["maxRetries"]
BACKOFF_FACTOR = config["ballchasing"]["backoffFactor"]
DELAYS = [0, *(BACKOFF_FACTOR**(r + 1) for r in range(MAX_RETRIES))]

VALID_PARSERS = ["carball", "ballchasing", "ballchasing-with-carball-shadow"]
if PARSER not in VALID_PARSERS:
    raise Exception(f"Unknown parser {PARSER}. Please specify one of: {', '.join(VALID_PARSERS)}")


def parse(path: str, on_progress: Callable[[str], None] = None):
    # For now, only parse with carball ever
    logging.info("Parsing with carball parser.")
    return _parse_carball(path, on_progress)
    if PARSER == "carball":
        return _parse_carball(path, on_progress)
    if PARSER == "ballchasing":
        return _parse_ballchasing(path, on_progress)
    if PARSER == "ballchasing-with-carball-shadow":
        return _parse_dual_with_shadow(path, on_progress)
    raise Exception(f"Parser {PARSER} not supported")


def _parse_dual_with_shadow(path: str, on_progress: Callable[[str], None] = None) -> dict:
    """
    Dark launch mode: Parse with ballchasing (primary) and carball (shadow).
    Always returns ballchasing results, but logs carball results and metrics for comparison.

    Args:
        path (str): The local path of the replay file to parse
        on_progress (Callable[[str], None], optional): Callback for progress updates

    Returns:
        dict: A dictionary containing stats from ballchasing (primary parser)
    """
    import time
    import json

    logging.info(f"Parsing {path} in dual mode: ballchasing (primary) + carball (shadow)")

    # Parse with ballchasing (primary)
    ballchasing_start = time.time()
    ballchasing_result = None
    ballchasing_error = None

    try:
        # Parse with carball (shadow) - errors are caught and logged
        carball_start = time.time()
        carball_result = None
        carball_error = None
        try:
            # Create a silent progress callback for shadow parsing
            shadow_progress = lambda msg: logging.debug(f"Carball shadow: {msg}")
            carball_result = _parse_carball(path, shadow_progress)
            carball_duration = time.time() - carball_start
            logging.info(f"Carball shadow parsing completed in {carball_duration:.2f}s")
        except Exception as e:
            carball_duration = time.time() - carball_start
            carball_error = str(e)
            logging.warning(f"Carball shadow parsing failed in {carball_duration:.2f}s: {carball_error}")
            logging.warning(f"Carball shadow failure does not affect primary result")

        ballchasing_result = _parse_ballchasing(path, on_progress)
        ballchasing_duration = time.time() - ballchasing_start
        logging.info(f"Ballchasing parsing completed in {ballchasing_duration:.2f}s")

        if carball_result:
            # Log comparison metrics
            _log_parser_comparison(path, ballchasing_result, carball_result,
                                   ballchasing_duration, carball_duration)
        
    except Exception as e:
        ballchasing_duration = time.time() - ballchasing_start
        ballchasing_error = str(e)
        logging.error(f"Ballchasing parsing failed in {ballchasing_duration:.2f}s: {ballchasing_error}")
        # Re-raise since ballchasing is the primary parser
        raise

    # Log and publish metrics for monitoring
    metrics = {
        "parser_mode": "dual-shadow",
        "primary": "ballchasing",
        "shadow": "carball",
        "ballchasing_duration_ms": int(ballchasing_duration * 1000),
        "carball_duration_ms": int(carball_duration * 1000) if carball_result else None,
        "ballchasing_success": ballchasing_result is not None,
        "carball_success": carball_result is not None,
        "carball_error": carball_error,
        "replay_path": path,
        "performance_diff_ms": int((carball_duration - ballchasing_duration) * 1000) if carball_result else None
    }
    logging.info(f"Parser comparison metrics: {json.dumps(metrics)}")

    # Publish shadow parser analytics in the same format as main analytics
    _publish_shadow_analytics(path, carball_result is not None, carball_error,
                              int(carball_duration * 1000) if carball_result or carball_error else None)

    # Always return the primary (ballchasing) result
    return ballchasing_result


def _publish_shadow_analytics(path: str, success: bool, error: str, duration_ms: int):
    """
    Publish shadow parser metrics to analytics queue for monitoring.

    Args:
        path (str): Replay file path
        success (bool): Whether carball parsing succeeded
        error (str): Error message if parsing failed
        duration_ms (int): Parse duration in milliseconds
    """
    try:
        from kombu import Producer, Connection
        from config import config
        import celeryconfig

        # Extract replay hash from path
        replay_hash = path.split("/")[-1].split(".")[0] if "/" in path else "unknown"

        analytics_message = json.dumps({
            "pattern": "analytics",
            "data": {
                "name": "parseReplay_shadowCarball",
                "tags": [
                    ["hash", replay_hash],
                    ["success", "true" if success else "false"],
                    ["parser", "carball"],
                    ["mode", "shadow"],
                    ["error", error if error else None]
                ],
                "booleans": [
                    ["success", success]
                ],
                "ints": [
                    ["parseMs", duration_ms]
                ] if duration_ms else []
            }
        })

        # Publish to analytics queue
        ssl_opts = {
            "server_hostname": celeryconfig._SERVER_HOSTNAME
        } if celeryconfig.SECURE else None

        with Connection(config["transport"]["url"], ssl=ssl_opts) as conn:
            producer = Producer(conn)
            producer.publish(
                analytics_message,
                routing_key=config["transport"]["analytics_queue"]
            )
            logging.debug(f"Published shadow parser analytics: {analytics_message}")

    except Exception as e:
        logging.warning(f"Failed to publish shadow parser analytics: {str(e)}")


def _log_parser_comparison(path: str, ballchasing_data: dict, carball_data: dict,
                           ballchasing_duration: float, carball_duration: float):
    """
    Compare results from both parsers and log discrepancies for analysis.

    Args:
        path (str): Replay file path
        ballchasing_data (dict): Results from ballchasing parser
        carball_data (dict): Results from carball parser
        ballchasing_duration (float): Parse time for ballchasing
        carball_duration (float): Parse time for carball
    """
    try:
        # Basic structure comparison
        comparison = {
            "replay": path,
            "performance": {
                "ballchasing_duration": ballchasing_duration,
                "carball_duration": carball_duration,
                "carball_speedup": f"{((ballchasing_duration - carball_duration) / ballchasing_duration * 100):.1f}%"
            }
        }

        # Compare high-level structure
        bc_keys = set(ballchasing_data.keys()) if ballchasing_data else set()
        cb_keys = set(carball_data.keys()) if carball_data else set()

        comparison["structure"] = {
            "ballchasing_keys": len(bc_keys),
            "carball_keys": len(cb_keys),
            "common_keys": len(bc_keys & cb_keys),
            "ballchasing_only": list(bc_keys - cb_keys)[:10],  # Limit to first 10
            "carball_only": list(cb_keys - bc_keys)[:10]
        }

        logging.info(f"Parser comparison: {json.dumps(comparison)}")

    except Exception as e:
        logging.warning(f"Failed to compare parser results: {str(e)}")


###############################
#
# Carball
#
###############################

def _parse_carball(path: str, on_progress: Callable[[str], None] = None) -> dict:
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
    logging.info(f"Parsing {path} with carball")

    from carball.analysis.analysis_manager import AnalysisManager
    from carball.json_parser.game import Game
    import carball

    try:
        # Step 1: Decompile the replay file to JSON
        if on_progress:
            on_progress("Decompiling replay...")
        _json = carball.decompile_replay(path)

        # Step 2: Initialize Game object with decompiled JSON
        if on_progress:
            on_progress("Initializing game data...")
        game = Game()
        game.initialize(loaded_json=_json)

        # Step 3: Create analysis and extract statistics
        if on_progress:
            on_progress("Analyzing replay...")
        analysis_manager = AnalysisManager(game)
        analysis_manager.create_analysis()

        return analysis_manager.get_json_data()

    except Exception as e:
        logging.error(f"Carball parsing failed for {path}: {str(e)}")
        raise Exception(f"Failed to parse replay with carball: {str(e)}")



###############################
#
# Ballchasing
#
###############################

def _is_rate_limit(response: Response, body: dict) -> bool:
    """
    https://ballchasing.com/doc/api#header-rate-limiting
    """
    return response.status_code == 429


def _parse_is_duplicate_replay(response: Response, body: dict) -> bool:
    """
    https://ballchasing.com/doc/api#upload-upload-post
    
    Response `409`
    """
    return response.status_code == 409 and body.get("error") == "duplicate replay"


def _parse_is_failed_replay(response: Response, body: dict) -> bool:
    """
    https://ballchasing.com/doc/api#upload-upload-post
    
    Response `400`
    """
    return response.status_code == 400


def _get_is_failed_replay(body: dict) -> bool:
    """
    https://ballchasing.com/doc/api#replays-replay-get
    
    Request `get a failed replay, e.g. could not be parsed`

    Response `200`
    """
    return body.get("status") == "failed"


def _get_is_pending_replay(body: dict) -> bool:
    """
    https://ballchasing.com/doc/api#replays-replay-get
    
    Request `get a pending replay, e.g. not processed yet`

    Response `200`
    """
    return body.get("status") == "pending"


def _get_is_ok_replay(body: dict) -> bool:
    """
    https://ballchasing.com/doc/api#replays-replay-get
    
    Request `get a successfully converted replay`

    Response `200`
    """
    return body.get("status") == "ok"


# TODO handle rate-limiting
def _parse_ballchasing(path: str, on_progress: Callable[[str], None] = None) -> dict:
    """
    Sends a Rocket League replay located at a given local path to Ballchasing
    and returns ballchasing stats

    Args:
        path (str): The local path of the replay file to parse

    Returns:
        dict: A dictionary containing all of the stats returned by Ballchasing
    """
    logging.info(f"Parsing {path} with Ballchasing")

    with open(path, "rb") as replay_file:
        ballchasing_id: str = None

        # Upload replay (not rate limited)
        for i, delay in enumerate(DELAYS):
            sleep(delay) # first delay is 0 seconds

            # On retries, send an intermediate progress update
            if i > 0:
                logging.info(f"Uploading replay {path} for parsing ({i + 1}/{MAX_RETRIES})...")
                on_progress(f"Uploading replay to Ballchasing ({i + 1}/{MAX_RETRIES})...")

            try:
                ballchasing_id = get_ballchasing_api().upload_replay(replay_file)["id"]
                break
            except Exception as e:
                err_body = e.args[1]

                if _parse_is_duplicate_replay(*e.args):
                    ballchasing_id = err_body["id"]
                    logging.debug(f"Replay already parsed {ballchasing_id}")
                    break

                elif i == MAX_RETRIES - 1:
                    raise Exception(f"Unable to upload replay {ballchasing_id} after {MAX_RETRIES} retries, total delay of {sum(DELAYS)}")
                
                elif _parse_is_failed_replay(*e.args):
                    logging.error(f"Parsing {path} with Ballchasing failed due to bad replay", err_body)
                    raise e
                else:
                    logging.error(f"Parsing {path} with Ballchasing failed, retrying in {DELAYS[i+1]} seconds", err_body)
                    continue

        # Get parsed stats, retrying while replay is pending or while we are rate-limited
        body: dict = None

        for i, delay in enumerate(DELAYS):
            sleep(delay) # first delay is 0 seconds

            # On retries, send an intermediate progress update
            if i > 0:
                logging.debug(f"Getting replay {ballchasing_id} from Ballchasing ({i + 1}/{MAX_RETRIES})...")
                on_progress(f"Getting stats from Ballchasing ({i + 1}/{MAX_RETRIES})...")

            try:
                body = get_ballchasing_api().get_replay(ballchasing_id)
            except Exception as e:
                if i == MAX_RETRIES - 1:
                    raise Exception(f"Unable to parse replay {ballchasing_id} after {MAX_RETRIES} retries, total delay of {sum(DELAYS)}")

                if _is_rate_limit(*e.args):
                    logging.debug(f"Rate limited, retrying in {DELAYS[i+1]} seconds")
                    continue
                else:
                    logging.error(f"Getting replay {ballchasing_id} from Ballchasing failed, retrying in {DELAYS[i+1]} seconds", err_body)
                    continue
            
            if _get_is_ok_replay(body):
                return body
            elif _get_is_pending_replay(body):
                logging.debug(f"Replay {ballchasing_id} still pending, retrying in {DELAYS[i+1]} seconds")
                continue
            elif _get_is_failed_replay(body):
                raise Exception(f"Got replay that failed parsing from ballchasing {ballchasing_id}")

        return body
