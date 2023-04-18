FROM python:3.8-slim as app_image

WORKDIR /app
COPY . .

# Install dependencies
RUN apt update
RUN apt install -y build-essential curl
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
RUN echo 'source $HOME/.cargo/env' >> $HOME/.bashrc
ENV PATH="/root/.cargo/bin:${PATH}"

# requests needs to be installed first because python-ballchasing fails installing without it
RUN python3 -m pip install requests
RUN python3 -m pip install -r requirements.txt

ENTRYPOINT ["./start.sh"]
