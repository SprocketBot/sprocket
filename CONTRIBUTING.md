# Contributing to Sprocket 

First off, thank you for taking the time to contribute! Sprocket is a project built by the community, for the community.

All types of contributions are welcome, for example:
- Code (via [Pull Requests](https://www.gitkraken.com/learn/git/tutorials/what-is-a-pull-request-in-git))
- Bug Reports (via [Issues](https://github.com/sprocketbot/sprocket/issues))
- Feature Requests (via [Issues](https://github.com/sprocketbot/sprocket/issues))
- Participating in [Discussions](https://github.com/sprocketbot/sprocket/discussions) or [Issues](https://github.com/sprocketbot/sprocket/issues)
- Getting involved in our [Discord](https://discord.gg/hJ3YAvHucb)

You can get a feel for what we are working on at our [GitHub Project](https://github.com/orgs/SprocketBot/projects/4)




## Setting up a local environment:

> [!IMPORTANT]  
> We highly recommend developing on Linux, MacOS, or using [WSL2](https://www.freecodecamp.org/news/how-to-install-wsl2-windows-subsystem-for-linux-2-on-windows-10/)
> Working with Javascript on Windows direclty can be an unpleasant experience


- To get started, you will need to have [Bun](https://bun.sh/) and [Docker](https://docker.com) installed. 
  Optionally have [NodeJS](https://nodejs.org/en) installed as well

- Copy `.env.example` to `.env`, this is where your configuration will go
  - You will at least need to set up a [Discord OAuth App](https://discord.com/developers/applications)
    - This OAuth App needs to have the correct redirect URL added to its
      configuration (http://api.l.ocket.cloud:8080/oauth/callback/discord)
    - You will need a bot token as well if you are working on the bot, this should be from the same project as your OAuth credentials
  - There are other auth providers that you can enable as well (e.g. Steam), but instructions for those are not available yet
  - You should not need to configure anything else, S3 information, and the URLs are all set up to work out of the box

- Use `bun i` from the root of the project to install the applications'
  dependencies
  - If on MacOS, instead use `docker run -v .:/app -w /app oven/bun bun i`, so
    that the dependency install is run inside of a linux container (which is
    where the apps will run), otherwise you'll get mac versions of the deps and
    things won't build.
- Use `docker compose up` to start all of the applications
  - Hint: use `docker compose up -d` to start everything without holding your terminal hostage, you can then use `docker compose logs [service name]` to see the logs of each service

- Use `./migrate-up` to apply the schema to your shiny new database

- Use `./seed` to put in some basic information (e.g. this tells Sprocket about Rocket League, and 2 made up leagues "Pro" and "Amateur")

- You should now be able to access and sign in to [l.ocket.cloud:8080](http://l.ocket.cloud:8080)
