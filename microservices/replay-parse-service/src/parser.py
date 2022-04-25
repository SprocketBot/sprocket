import logging
import carball

def parse(path):
    """Parses a Rocket League replay located at a given local path

    Args:
        path (str): The local path of the replay file to parse

    Returns:
        dict: A dictionary containing all of the stats returned by carball
    """
    analysis_manager = carball.analyze_replay_file(path, logging_level=logging.ERROR)
    return analysis_manager.get_json_data()
