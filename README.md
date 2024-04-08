<div align="center">

<h1> Sprocket </h1>
<p>League Managment for Everyone</p>

---


[![Discord Server](https://img.shields.io/discord/856290331279884288.svg?label=Discord&logo=Discord&colorB=7289da&style=for-the-badge)](https://discord.gg/hJ3YAvHucb)
[![Support us on Ko-Fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/sprocketbot)
[![Twitter](https://img.shields.io/badge/Twitter-%231DA1F2.svg?style=for-the-badge&logo=Twitter&logoColor=white)](https://twitter.com/SprocketBot_)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/sprocketbot)

</div>

Sprocket is a platform primarily used to manage and automate organized Esports leagues, one such example being [Minor League Esports](https://mlesports.gg).
The platform uses a Microservice pattern, and this repository contains everything needed to quickly start a new microservice.


## Running Locally

Sprocket comes with a [Docker Compose](./docker-compose.yaml) file that can be used to easily run the platform locally.

### Pre-requisites

You will **need**  
1. A [Discord OAuth Application](https://discord.com/developers/applications)
2. [Docker (compose)](https://docs.docker.com/engine/install/) Installed
3. The [Bun](https://bun.sh/) Javascript Runtime
4. That's it!

You may **want**  
1. A [Steam API Key](https://steamcommunity.com/dev/apikey)
    1. This is used to link Steam Accounts
2. An [Azure OAuth Application](https://portal.azure.com)
    1. This is used for Microsoft / Xbox account linking
3. Other platform OAuth applications as they become available

### Setup

1. Once you have cloned the repository, copy `.env.example` to `.env`
    1. The root [`config.yaml`](./config.yaml) is shared between all microservices, and can reference environment variables with sensible defaults. Some will be populated automatically (e.g. Postgres configuration), others will need to be set yourself
    1. You will need to configure:
        - `AUTH_DISCORD_CLIENT_ID`, `AUTH_DISCORD_SECRET` and `AUTH_DISCORD_BOT_TOKEN`
            - Bot token is only required if running the discord microservice
1. Install dependencies by running `bun i` from the root of the project.
    1. Sprocket uses [Bun workspaces](https://bun.sh/docs/install/workspaces), which means that all dependencies are installed from the root of the project.
    1. When adding a new service or package, ensure that the root [package.json](./package.json) is updated to include it
1. Once you have configured the environment to your liking, `docker compose up`, and navigate to [localhost:8080](http://localhost:8080).
1. Run the [`migrate:up`](./migrate:up) and [`seed`](./seed) scripts to initialize the database and populate it with some basic data