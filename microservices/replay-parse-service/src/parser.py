import logging
from time import sleep
import carball
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
BALLCHASING_API = ballchasing.Api(BALLCHASING_TOKEN, sleep_time_on_rate_limit=0, print_on_rate_limit=False)
PARSER = config["parser"]
MAX_RETRIES = config["ballchasing"]["maxRetries"]
BACKOFF_FACTOR = config["ballchasing"]["backoffFactor"]
DELAYS = [0, *(BACKOFF_FACTOR**(r + 1) for r in range(MAX_RETRIES))]

if PARSER != "carball" and PARSER != "ballchasing":
    raise Exception(f"Unknown parser {PARSER}. Please specify either 'carball' or 'ballchasing'.")


def parse(path: str):
    if PARSER == "carball":
        return _parse_carball(path)
    if PARSER == "ballchasing":
        return _parse_ballchasing(path)



###############################
#
# Carball
#
###############################

def _parse_carball(path: str) -> dict:
    """
    Parses a Rocket League replay located at a given local path

    Args:
        path (str): The local path of the replay file to parse

    Returns:
        dict: A dictionary containing all of the stats returned by carball
    """
    logging.info(f"Parsing {path} with carball")

    analysis_manager = carball.analyze_replay_file(path, logging_level=logging.ERROR)
    return analysis_manager.get_json_data()



###############################
#
# Ballchasing
#
###############################

def _is_rate_limit(response: Response, body: dict) -> bool:
    """
    https://ballchasing.com/doc/api#header-rate-limiting
    """
    return "status_code" in response and response.status_code == 429


def _parse_is_duplicate_replay(response: Response, body: dict) -> bool:
    """
    https://ballchasing.com/doc/api#upload-upload-post
    
    Response `409`
    """
    return "status_code" in response and response.status_code == 409 and body.get("error") == "duplicate replay"


def _parse_is_failed_replay(response: Response, body: dict) -> bool:
    """
    https://ballchasing.com/doc/api#upload-upload-post
    
    Response `400`
    """
    return "status_code" in response and response.status_code == 400


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
def _parse_ballchasing(path: str) -> dict:
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
        for retry in range(MAX_RETRIES):
            sleep(DELAYS[retry]) # first delay is 0 seconds

            logging.debug(f"Uploading replay {path} for parsing ({retry+1}/{MAX_RETRIES})...")

            try:
                ballchasing_id = BALLCHASING_API.upload_replay(replay_file)["id"]
            except Exception as e:
                err_body = e.args[1]
                if _parse_is_duplicate_replay(*e.args):
                    ballchasing_id = err_body["id"]
                    logging.debug(f"Replay already parsed {ballchasing_id}")
                    break
                elif _parse_is_failed_replay(*e.args):
                    logging.error(f"Parsing {path} with Ballchasing failed due to bad replay", err_body)
                    raise e
                else:
                    logging.error(f"Parsing {path} with Ballchasing failed, retrying in {DELAYS[retry+1]} seconds", err_body)
                    continue


        # Get parsed stats, retrying while replay is pending or while we are rate-limited
        body: dict = None

        for retry in range(MAX_RETRIES):
            sleep(DELAYS[retry]) # first delay is 0 seconds

            logging.debug(f"Getting replay {ballchasing_id} from Ballchasing ({retry+1}/{MAX_RETRIES})...")

            try:
                body = BALLCHASING_API.get_replay(ballchasing_id)
            except Exception as e:
                if _is_rate_limit(*e.args):
                    logging.debug(f"Rate limited, retrying in {DELAYS[retry+1]} seconds")
                    continue
                else:
                    logging.error(f"Getting replay {ballchasing_id} from Ballchasing failed, retrying in {DELAYS[retry+1]} seconds", err_body)
                    continue
            
            if _get_is_ok_replay(body):
                return body
            elif _get_is_pending_replay(body):
                logging.debug(f"Replay {ballchasing_id} still pending, retrying in {DELAYS[retry+1]} seconds")
                continue
            elif _get_is_failed_replay(body):
                raise Exception(f"Got replay that failed parsing from ballchasing {ballchasing_id}")

        if body is None:
            raise Exception(f"Unable to parse replay {ballchasing_id} after {MAX_RETRIES} retries, total delay of {sum(DELAYS)}")

        return body
