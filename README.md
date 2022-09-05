# Sprocket Project Repo

<div align="center">
  
  [![Discord Server](https://img.shields.io/discord/856290331279884288.svg?label=Discord&logo=Discord&colorB=7289da&style=for-the-badge)](https://discord.gg/hJ3YAvHucb)
  [![Support us on Ko-Fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/sprocketbot)
  [![Twitter](https://img.shields.io/badge/Twitter-%231DA1F2.svg?style=for-the-badge&logo=Twitter&logoColor=white)](https://twitter.com/SprocketBot_)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/sprocketbot)
  
</div>

---

Sprocket is a platform primarily used to manage and automate organized Esports leagues, one such example being [Minor League Esports](https://mlesports.gg).
The platform uses a Microservice pattern, and this repository contains everything needed to quickly start a new microservice.


## Building / Running this Repository

### Installing Dependencies:

```bash
# In the root directory
npm i
```

### Building Projectsnpm
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
