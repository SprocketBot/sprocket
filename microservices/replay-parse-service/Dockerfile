ARG BASE_IMAGE
FROM $BASE_IMAGE AS app_image

RUN cd microservices/replay-parse-service

# Create and activate venv
RUN python3 -m venv env
RUN . /app/env/bin/activate

# Install dependencies
# requests needs to be installed first because python-ballchasing fails installing without it
RUN python3 -m pip install requests
RUN python3 -m pip install -r requirements.txt

ENTRYPOINT start.sh
