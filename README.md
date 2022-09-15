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

## Building Docker images
### Build the base image
```shell
docker build . -f dockerfiles/node.Dockerfile -t sprocket-base-image --build-arg COMMIT_SHA=$(git log -1 --format=%H)

docker image ls | grep sprocket
# ->
#    sprocket-base-image                                   latest             cfb627899675   5 seconds ago   1.01GB
```

### Build microservice image
For example, building `clients/web`:
```shell
docker build . -f clients/web/Dockerfile -t sprocket-web --build-arg BASE_IMAGE=sprocket-base-image

docker image ls | grep sprocket
# ->
#    sprocket-web                                          latest             6661a25ebce4   5 seconds ago    1.01GB
#    sprocket-base-image                                   latest             cfb627899675   30 seconds ago   1.01GB
```

## Inspecting `COMMIT_SHA` of Image / Container
```shell
docker inspect --format='{{range .Config.Env}}{{println .}}{{end}}' <image/container name or id> | grep COMMIT_SHA
```
