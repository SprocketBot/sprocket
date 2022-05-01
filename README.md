# Sprocket Project Repo
[![Support Server](https://img.shields.io/discord/856290331279884288.svg?label=Discord&logo=Discord&colorB=7289da&style=for-the-badge)](https://discord.gg/vpEv3HJ)

---

Sprocket is a platform primarily used to manage and automate organized Esports leagues, one such example being [Minor League Esports](https://mlesports.gg).
The platform uses a Microservice pattern, and this repository contains everything needed to quickly start a new microservice.


## Building / Running this Repository

### Installing Dependencies:

```bash
# In the root directory
npm i
```

### Building Projects
```bash
# In the root directory
npm run build --workspaces --if-present
```

### Running Projects
```bash
# In the project directory
npm run dev
# For the replay parse service
./start.sh
```