ARG BASE_IMAGE
FROM $BASE_IMAGE AS app_image

RUN cd microservices/replay-parse-service

# Install python and pip, BASE_IMAGE doesn't have it preinstalled
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

# Create and activate venv
RUN python3 -m venv env
RUN . env/bin/activate

RUN ls

# Install dependencies
# requests needs to be installed first because python-ballchasing fails installing without it
RUN python3 -m pip install requests
RUN python3 -m pip install -r requirements.txt

ENTRYPOINT start.sh
