ARG BASE_IMAGE
FROM $BASE_IMAGE AS app_image

RUN cd microservices/replay-parse-service

# Install python and pip, BASE_IMAGE doesn't have it preinstalled
RUN apt-get update -y
RUN apt-get install -y python3 python3-pip python3-venv

# Create and activate venv
RUN python3 -m venv env
RUN . env/bin/activate

# Install dependencies
# requests needs to be installed first because python-ballchasing fails installing without it
RUN python3 -m pip install requests
RUN python3 -m pip install -r requirements.txt

ENTRYPOINT start.sh
