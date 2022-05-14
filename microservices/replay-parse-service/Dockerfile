FROM python:3.8-slim AS app_image
RUN mkdir /app && python3 -m venv app/env
COPY . /app
WORKDIR /app
    # Install Python Deps
RUN . /app/env/bin/activate \
    && python3 -m pip install requests \
    && python3 -m pip install -r requirements.txt
ENTRYPOINT ["/app/start.sh"]
