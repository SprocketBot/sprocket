#!/bin/bash

. env/bin/activate
cd src && celery -A main worker --loglevel=INFO
