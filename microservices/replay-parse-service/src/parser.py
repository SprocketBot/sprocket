import logging
import carball
import ballchasing

from config import config

ballchasing_token = config["ballchasing"]["apiToken"]
ballchasing_api = ballchasing.Api(ballchasing_token, None, True)
PARSER = config["parser"]

if PARSER != "carball" and PARSER != "ballchasing":
    raise Exception(f"Unknown parser {PARSER}. Please specify either 'carball' or 'ballchasing'.")

def parse(path):
    if PARSER == "carball":
        return parse_carball(path)
    if PARSER == "ballchasing":
        return parse_ballchasing(path)

def parse_carball(path):
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
            upload_response = ballchasing_api.upload_replay(replay_file)
        except Exception as e:
            if is_duplicate_replay(e):
                upload_response = e.args[1]
                pass
            else:
                raise e

        replay_id = upload_response["id"]
        get_response = ballchasing_api.get_replay(replay_id)

        return get_response
