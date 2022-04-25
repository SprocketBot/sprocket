import json

def get_analytics_msg(d: dict):
    """
    success: boolean
    getDuration: float (ms)
    parseDuration: float (ms)
    putDuration: float (ms)
    totalDuration: float(ms)
    replay size: float (Kb)
    hash: string, tag
    """

    tags = [
        ["hash", d.get("hash")],
        ["success", str(d.get("success"))],
        ["cached", str(d.get("cached"))]
    ]
    booleans = [
        ["success", d.get("success")],
        ["cached", d.get("cached")]
    ]
    floats = [
        ["getMs", d.get("getMs")],
        ["parseMs", d.get("parseMs")],
        ["putMs", d.get("putMs")],
        ["totalMs", d.get("totalMs")],
        ["replayKb", d.get("replaySize")]
    ]

    return json.dumps({
        "pattern": "analytics",
        "data": {
            "name": "parseReplay",
            "tags": list(filter(lambda x: x[1] is not None, tags)),
            "booleans": list(filter(lambda x: x[1] is not None, booleans)),
            "floats": list(filter(lambda x: x[1] is not None, floats))
        }
    })
