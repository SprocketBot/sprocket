import os
import json
import logging
import boto3
from botocore.exceptions import ClientError
from typing import Optional

from config import config

ENDPOINT_URL = config["s3"]["endpoint"]
BUCKET_NAME = config["s3"]["bucket"]
TEMP_DIR = config["tempDir"]

# Uses credentials from filepath in env AWS_SHARED_CREDENTIALS_FILE
s3 = boto3.resource('s3', endpoint_url=ENDPOINT_URL)

BUCKET = s3.Bucket(BUCKET_NAME)

def get(object_name: str) -> Optional[dict]:
    """
    Fetches a JSON file's contents from S3.
    The bucket is configured by config.s3.bucket
    
    Args:
        object_name: The name of the object to download.

    Returns:
        A dictionary containing the file's contents, or None if the
        file does not exist.
    
    Throws:
        If the download fails for any reason other than the object not existing.
    """
    try:
        res = BUCKET.Object(object_name).get()
        content = res['Body'].read().decode('utf-8')
        return json.loads(content)
    except ClientError as error:
        if error.response["Error"]["Code"] == "NoSuchKey":
            return None
        else:
            logging.error(f"Unexpected error when getting object contents {error.response}")
            raise error
    except Exception as error:
        logging.error(f"Unexpected error when getting object contents {error}")
        raise error

def fget(object_name: str) -> Optional[str]:
    """
    Downloads a file from S3 to temporary storage in `config.tempDir`.
    The bucket is configured by config.s3.bucket.

    Args:
        object_name: The name of the object to download.

    Returns:
        A string containing the path of the local file
        (<config.tempDir>/<object_name>), or None if the file
        does not exist.
    
    Throws:
        If the download fails for any reason other than the object not existing.
    """
    path = f"{TEMP_DIR}/{object_name}"
    print(path)
    try:
        __mkdir_p(path)
        BUCKET.Object(object_name).download_file(path)
        return path
    except ClientError as error:
        logging.error(f"Unexpected error when downloading object {error.response}")
        raise error
    except Exception as error:
        logging.error(f"Unexpected error when downloading object {error}")
        raise error

def put(object_name: str, data: dict):
    """
    Uploads JSON a file to S3
    The bucket is configured by config.s3.bucket.
    
    Args:
        object_name: The name to give the uploaded object.
        data: The data to upload.
    
    Returns:
        None
    
    Throws:
        If the upload fails.
    """
    try:
        bytes = json.dumps(data).encode("utf-8")
        # s3.put_object(BUCKET_NAME, object_name, io.BytesIO(bytes), len(bytes))
        res = BUCKET.Object(object_name).put(Body=bytes)
        print(res)
    except ClientError as error:
        logging.error(f"Unexpected error when putting object {error.response}")
    except Exception as error:
        logging.error(f"Unexpected error when putting object {error}")
        raise error

def __mkdir_p(filepath: str) -> None:
    """Ensures a directory path exists to allow writing a file"""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
