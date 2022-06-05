FROM python:3.8-slim as app_image

WORKDIR /app
COPY . .

# Install dependencies
# requests needs to be installed first because python-ballchasing fails installing without it
RUN python3 -m pip install requests
RUN python3 -m pip install -r requirements.txt

ENTRYPOINT ["./start.sh"]
