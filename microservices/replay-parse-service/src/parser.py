import logging
from typing import Tuple
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

BALLCHASING_API = ballchasing.Api(BALLCHASING_TOKEN, None, True)
PARSER = config["parser"]

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

def _is_duplicate_replay(response: Response, body: dict):
    return response.status_code == 409 and body["error"] == "duplicate replay"


def _is_failed_replay(response: Response, body: dict):
    return response.status_code == 400


def _is_pending_replay(response: Response, body: dict):
    return True


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
        
        try:
            ballchasing_id = BALLCHASING_API.upload_replay(replay_file)
        except Exception as e:
            if _is_duplicate_replay(*e.args):
                ballchasing_id = e.args[1]["id"]
                pass
            elif _is_failed_replay(*e.args):
                logging.error(f"Parsing {path} with Ballchasing failed", e)
                raise e
            else:
                logging.error(f"Parsing {path} with Ballchasing failed", e)
                raise e

        # TODO handle rate-limiting
        # TODO handle pending replays (exponential backoff, fail after X tries)

        get_response = BALLCHASING_API.get_replay(ballchasing_id)

        return get_response



###############################
#
# Testing
#
###############################

DIR = "/mnt/c/Users/zachs/Documents/My Games/Rocket League/TAGame/Demos/testing"
FAIL_REPLAY = f"{DIR}/fail.replay"
DUPLICATE_REPLAY = f"{DIR}/duplicate.replay"

if __name__ == "__main__":
    results = _parse_ballchasing(DUPLICATE_REPLAY)
    print(results)
