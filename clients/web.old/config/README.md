# Sprocket Web Client Config

<br>

## <p align="center">⚠️⚠️⚠️</p>
---

## _Special care must be taken with web client config because secrets **must not** be exposed to end users._

## _If you are modifying application config, please make sure you understand everything outlined in this README._

---
## <p align="center">⚠️⚠️⚠️</p>

<br>

## Client config
Client config is specified in the `"client"` section of the config json. These values **are exposed to users** and therefore **must not contain secrets** or other sensitive information.

## Server config
Server config is specified in the `"server"` section of the config json. These values are used only on the server-side portion of the client (SvelteKit endpoints). Values here **will not be exposed to users**, but they still **should not contain secrets** or other sensitive information. Secrets should be placed in `.txt` files in the `secret` directory, so that they can be more easily injected into the container by our Pulumi infrastructure.
