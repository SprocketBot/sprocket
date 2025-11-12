import io
import json
from minio import Minio
from config import config

# Lazily initialize client on first use
_client = None

def get_client():
    """Get or create the Minio client instance"""
    global _client
    if _client is None:
        _client = Minio(
            config["minio"]["hostname"],
            access_key=config["minio"]["accessKey"],
            secret_key=config["minio"]["secret_key"],
            secure=config["minio"]["secure"],
        )
    return _client

BUCKET = config["minio"]["bucket"]
TEMP_DIR = config["tempDir"]

def get(object_name):
    """Fetches a file's contents from minio.
    The bucket is configured by config.minio.bucket

    Args:
        object_name (str): The name of the object to download.

    Returns:
        HTTPResponse: The response from the minio request

    """
    response = get_client().get_object(BUCKET, object_name)
    return json.loads(response.read())

def fget(object_name):
    """Downloads a file from minio to temporary storage in config.tempDir.
    The bucket is configured by config.minio.bucket.

    Args:
        object_name (str): The name of the object to download.

    Returns:
        str: The path of the local file, <config.tempDir>/<object_name>
    """
    path = f"{TEMP_DIR}/{object_name}"
    get_client().fget_object(BUCKET, object_name, path)
    return path

def put(object_name, data):
    """Uploads a file to minio
    The bucket is configured by config.minio.bucket.

    Args:
        object_name (str): The name to give the uploaded object.
        data (dict): The data to upload.
    """
    bytes = json.dumps(data).encode("utf-8")
    get_client().put_object(BUCKET, object_name, io.BytesIO(bytes), len(bytes))
