# Sprocket Server Analytics Service

[![Discord Chat](https://img.shields.io/discord/856290331279884288.svg)](https://discord.gg/hJ3YAvHucb)  

Sprocket is a platform primarily used to manage and automate organized Esports leagues, one such example being [Minor League Esports](https://mlesports.gg).

The platform uses a Microservice pattern, and this service is responsible for accepting generic data points from other services and flushing them into [InfluxDB](https://www.influxdata.com/). The data can then be used to identify areas where performance can be increased, and areas that are seeing high usage by users (i.e. discord command usage frequency)