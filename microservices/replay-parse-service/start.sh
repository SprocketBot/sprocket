#!/bin/bash

export AWS_SHARED_CREDENTIALS_FILE=~/code/SprocketBot/sprocket/.aws/credentials

. env/bin/activate
cd src && celery -A main worker --loglevel=INFO
