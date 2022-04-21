import os, json

env = os.environ.get("ENV")
if env == None:
    env = "development"

with open("../config/default.json", "r") as f:
    defaultConfig = json.loads(f.read())

with open(f"../config/{env}.json", "r") as f:
    envConfig = json.loads(f.read())

config = {**defaultConfig, **envConfig}
