FROM python:3.8-slim AS app_image
RUN mkdir /app && python -m venv app/env
COPY . /app
WORKDIR /app
RUN . /app/env/bin/activate && pip install -r requirements.txt   # Install Python Deps
ENTRYPOINT ["/app/start.sh"]
