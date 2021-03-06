import io
import json
from minio import Minio
from config import config

# Load minio secretKey from file
S3_SECRET_FILE = open("../secret/s3-secret", "r")
S3_SECRET = S3_SECRET_FILE.read()
if len(S3_SECRET.strip()) == 0:
    print("Missing required secret: 'secret/s3-secret'`")
    exit(1)
S3_SECRET_FILE.close()

client = Minio(
    config["minio"]["hostname"],
    access_key=config["minio"]["accessKey"],
    secret_key=S3_SECRET,
    secure=config["minio"]["secure"],
)

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
    response = client.get_object(BUCKET, object_name)
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
    client.fget_object(BUCKET, object_name, path)
    return path

def put(object_name, data):
    """Uploads a file to minio
    The bucket is configured by config.minio.bucket.
    
    Args:
        object_name (str): The name to give the uploaded object.
        data (dict): The data to upload.
    """
    bytes = json.dumps(data).encode("utf-8")
    client.put_object(BUCKET, object_name, io.BytesIO(bytes), len(bytes))
