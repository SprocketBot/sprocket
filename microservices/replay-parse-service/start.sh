#!/bin/bash

cd src && python -m celery -A main worker --loglevel=DEBUG
