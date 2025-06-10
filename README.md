<div align="center">

<h1> Sprocket </h1>
<p>League Managment for Everyone</p>

---

[![Discord Server](https://img.shields.io/discord/856290331279884288.svg?label=Discord&logo=Discord&colorB=7289da&style=for-the-badge)](https://discord.gg/hJ3YAvHucb)
[![Support us on Ko-Fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/sprocketbot)
[![Twitter](https://img.shields.io/badge/Twitter-%231DA1F2.svg?style=for-the-badge&logo=Twitter&logoColor=white)](https://twitter.com/SprocketBot_)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/sprocketbot)

</div>

Sprocket is a platform primarily used to manage and automate organized Esports
leagues, one such example being [Minor League Esports](https://mlesports.gg).

The platform uses a Microservice pattern, and this repository contains
everything needed to quickly start a new microservice.

## Running Locally

Sprocket comes with a [Docker Compose](./docker-compose.yaml) file that can be
used to easily run the platform locally.

### Pre-requisites

You will **need**

1. A [Discord OAuth Application](https://discord.com/developers/applications)
   - Make sure that you have set up an OAuth Redirect URL of `http://api.l.ocket.cloud:8080/oauth/callback/discord`
   - If you are using a base url other than localhost; adjust the redirect url accordingly
2. [Docker (compose)](https://docs.docker.com/engine/install/) Installed
3. The [Bun](https://bun.sh/) Javascript Runtime
4. If you're on Windows, you'll need to install [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) and [Node.js/NPM](https://learn.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-wsl)
5. That's it!

You may **want**

1. A [Steam API Key](https://steamcommunity.com/dev/apikey)
   This is used to link Steam Accounts
2. An [Azure OAuth Application](https://portal.azure.com)
   This is used for Microsoft / Xbox account linking
3. Other platform OAuth applications as they become available
4. A database client such as [datagrip](https://www.jetbrains.com/datagrip/) or [dbeaver](https://dbeaver.io/download/)
   - Make sure to not have a version of Postgres installed, as it could cause conflicting issues when you attempt to access the database using your client

### Setup

1. Once you have cloned the repository, copy `.env.example` to `.env`
   1. The root [`config.yaml`](./config.yaml) is shared between all
      microservices, and can reference environment variables with sensible
      defaults. Some will be populated automatically (e.g. Postgres
      configuration), others will need to be set yourself
   2. You will need to configure:
      - `AUTH_DISCORD_CLIENT_ID`, `AUTH_DISCORD_SECRET` and `AUTH_DISCORD_BOT_TOKEN`
        - Bot token is only required if running the discord microservice
      - Your Discord application will also need to be configured with the
        redirect URL which this app uses: `http://api.l.ocket.cloud:8080/oauth/callback/discord`
2. Install dependencies by running `bun i` from the root of the project.
   1. Sprocket uses [Bun workspaces](https://bun.sh/docs/install/workspaces),
      which means that all dependencies are installed from the root of the
      project.
   2. When adding a new service or package, ensure that the root
      [package.json](./package.json) is updated to include it
   3. **Note for MacOS Users:** Bun needs to be run within a linux container to
      properly install dependencies, as we're running the whole project within
      linux containers. To do this, run `docker run -v .:/app -w /app oven/bun
bun i` instead of just `bun i` above. Make sure your `node_modules/`
      folder is deleted before doing this!
3. Once you have configured the environment to your liking, `docker compose up`,
   and navigate to [l.ocket.cloud:8080](http://l.ocket.cloud:8080).
4. Add your discord username under the "initial admins" in the [`./config.yaml`](./config.yaml) file
5. Run the [`./migrate-up`](./migrate-up) and [`./seed`](./seed) scripts to
   initialize the database and populate it with some basic data

## FAQ

### Updating Bun Version:

- Update all relevant containers in [docker-compose.yaml](./docker-compose.yaml)
- Update the base image in [Dockerfile](./Dockerfile)
