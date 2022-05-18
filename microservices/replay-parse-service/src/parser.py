import logging
import carball
import ballchasing
import json

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

def parse(path):
    if PARSER == "carball":
        return parse_carball(path)
    if PARSER == "ballchasing":
        return parse_ballchasing(path)

def parse_carball(path):
    logging.info(f"Parsing {path} with carball")
    """
    Parses a Rocket League replay located at a given local path

    Args:
        path (str): The local path of the replay file to parse

    Returns:
        dict: A dictionary containing all of the stats returned by carball
    """
    analysis_manager = carball.analyze_replay_file(path, logging_level=logging.ERROR)
    return analysis_manager.get_json_data()

def is_duplicate_replay(exception):
    return exception.args[0].status_code == 409

def parse_ballchasing(path):
    logging.info(f"Parsing {path} with Ballchasing")
    """
    Sends a Rocket League replay located at a given local path to Ballchasing
    and returns ballchasing stats

    Args:
        path (str): The local path of the replay file to parse

    Returns:
        dict: A dictionary containing all of the stats returned by Ballchasing
    """
    with open(path, "rb") as replay_file:
        upload_response = None
        try:
            upload_response = BALLCHASING_API.upload_replay(replay_file)
        except Exception as e:
            if is_duplicate_replay(e):
                upload_response = e.args[1]
                pass
            else:
                logging.error(f"Parsing {path} with Ballchasing failed", e)
                raise e

        # TODO handle rate-limiting
        # TODO handle pending replays (exponential backoff, fail after X tries)
        # TODO handle replays that fail parsing in ballchasing

        replay_id = upload_response["id"]
        get_response = BALLCHASING_API.get_replay(replay_id)

        return get_response
