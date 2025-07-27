variable "base_url" {
  type = string
}

variable "environment" {
  type = string
}

variable "monorepo_image" {
  type = string
}

job "Sprocket-%%environment%%" {
  vault {
    policies     = ["nomad"]
    change_mode  = "restart"
    disable_file = true
  }

  group "lavinmq" {
    network {
      port "lavinmq-http" {
        to = 15672
      }
      port "lavinmq" {
        to = 5672
      }
    }
    task "lavinmq" {
      driver = "docker"
      config {
        image = "cloudamqp/lavinmq"
        ports = ["lavinmq-http", "lavinmq"]
      }
      service {
        name     = "lavinmq-${var.environment}"
        provider = "consul"
        port     = "lavinmq"
      }
      service {
        name     = "lavinmq-${var.environment}-ui"
        provider = "consul"
        port     = "lavinmq-http"

        tags = [
          "traefik.enable=true",
          "traefik.http.routers.lavinmq-ui-${var.environment}.rule=Host(`lavinmq.utils.${var.environment}.${var.base_url}`)",

          "traefik.http.routers.lavinmq-ui-${var.environment}.tls=true",
          "traefik.http.routers.lavinmq-ui-${var.environment}.tls.certResolver=lets-encrypt",
          "traefik.http.routers.lavinmq-ui-${var.environment}.entrypoints=web,websecure",
        ]
      }
    }
  }

  group "web" {
    spread {
      attribute = "${node.datacenter}"
    }
    count = 2
    update {
      max_parallel     = 1
      min_healthy_time = "30s"
      healthy_deadline = "5m"
    }


    network {
      port "http" {
        to = 3000
      }
    }

    task "web" {
      resources {
        memory = 512
        cpu    = 1024
      }
      driver = "docker"
      config {
        image      = "${var.monorepo_image}"
        ports      = ["http"]
        force_pull = true
        args       = ["exec", "web"]
      }
      env {
        PUBLIC_API_URL    = "api.${var.environment}.${var.base_url}"
        PUBLIC_API_SECURE = true
        PUBLIC_API_PORT   = 443
        PRIVATE_API_URL    = "api.${var.environment}.${var.base_url}"
        PRIVATE_API_SECURE = true
        PRIVATE_API_PORT   = 443
      }

      service {
        name     = "${var.environment}-web"
        provider = "consul"
        port     = "http"

        tags = [
          "traefik.enable=true",
          "traefik.http.routers.sprocket-web-${var.environment}.rule=Host(`${var.environment}.${var.base_url}`)",
          "traefik.http.routers.sprocket-web-${var.environment}.tls=true",
          "traefik.http.routers.sprocket-web-${var.environment}.tls.certResolver=lets-encrypt",
          "traefik.http.routers.sprocket-web-${var.environment}.entrypoints=web,websecure",
        ]
      }
    }
  }


  group "core" {
    spread {
      attribute = "${node.datacenter}"
    }

    network {
      port "http" {
        to = 3000
      }
    }
    count = 2
    update {
      max_parallel     = 1
      min_healthy_time = "30s"
      healthy_deadline = "5m"
    }

    task "core" {
      resources {
        memory = 1024
        cpu    = 2048
      }
      driver = "docker"
      config {
        image      = "${var.monorepo_image}"
        ports      = ["http"]
        args       = ["exec", "core"]
        force_pull = true
      }
      env {
        BASE_URL     = "${var.environment}.${var.base_url}"
        CORE_URL     = "api.${var.environment}.${var.base_url}"
        LISTEN_PORT  = 443
        SSL          = true
        PROD         = true
        SERVICE_NAME = "SprocketCore-%%environment%%"
        LOG_LEVEL    = "debug"
      }

      template {
        destination = "/secret/.env"
        env         = true

        data = <<EOF
{{ with secret "kv2/nomad/${var.environment}/jwt" }}
AUTH_JWT_SECRET="{{ .Data.data.secret }}"
AUTH_JWT_EXPIRY="7200000" # 2 Hours in ms
{{ end }}

{{ with secret "kv2/nomad/${var.environment}/creds/discord" }}
AUTH_DISCORD_CLIENT_ID="{{ .Data.data.clientId }}"
AUTH_DISCORD_SECRET="{{ .Data.data.secret }}"
{{ end }}

{{ with secret "kv2/nomad/${var.environment}/creds/steam" }}
AUTH_STEAM_API_KEY="{{ .Data.data.apiKey }}"
{{ end }}

{{ with secret "kv2/nomad/${var.environment}/creds/mslive" }}
AUTH_LIVE_CLIENT_ID="{{ .Data.data.clientId }}"
AUTH_LIVE_CLIENT_SECRET="{{ .Data.data.clientSecret }}"
{{ end }}

{{ with secret "database/creds/nomad-sprocket-${var.environment}" }}
PG_USER="{{ .Data.username }}"
PG_PASS="{{ .Data.password }}"
{{ end }}

# TODO: Get proxy for current datacenter
{{- range service "stolon-proxy" }}
PG_HOST="{{ .Address }}"
PG_PORT="{{ .Port }}"
{{ end }}

PG_DATABASE="sprocket-${var.environment}"

{{- range service "redis-${var.environment}" }}
REDIS_HOST="{{ .Address }}"
REDIS_PORT="{{ .Port }}"
{{ end }}

{{- range service "lavinmq-${var.environment}" }}
# TODO: Should we set up the rabbitmq vault driver? Does it work with LavinMQ?
AMQP_URL="amqp://{{ .Address }}:{{ .Port }}"
{{ end }}

{{ with secret "kv2/nomad/${var.environment}/creds/backblaze" }}
S3_APP_KEY="{{ .Data.data.keySecret }}"
S3_KEY_ID="{{ .Data.data.keyId }}"
S3_KEY_NAME="{{ .Data.data.keyName }}"
S3_ENDPOINT="https://s3.us-west-004.backblazeb2.com"
S3_BUCKET="sprocket-v2"
S3_PREFIX="${var.environment}"
{{ end }}
        EOF
      }

      action "run-migrations" {
        command = "bun"
        args = [
          "/app/core/src/datasource.ts", "up"
        ]
      }
    }

    service {
      name     = "${var.environment}-core"
      provider = "consul"
      port     = "http"

      check {
        method   = "GET"
        name     = "Sprocket Core /health"
        path     = "/health"
        interval = "30s"
        protocol = "http"
        timeout  = "5s"
        type     = "http"
      }

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.sprocket-core-${var.environment}.rule=Host(`api.${var.environment}.${var.base_url}`)",
        "traefik.http.routers.sprocket-core-${var.environment}.tls=true",
        "traefik.http.routers.sprocket-core-${var.environment}.tls.certResolver=lets-encrypt",
        "traefik.http.routers.sprocket-core-${var.environment}.entrypoints=web,websecure",
      ]
    }
  }

  group "discord-bot" {
    update {
      max_parallel     = 1
      min_healthy_time = "30s"
      healthy_deadline = "5m"
    }
    task "discord-bot" {
      resources {
        memory = 512
        cpu    = 512
      }
      driver = "docker"
      config {
        image      = "${var.monorepo_image}"
        force_pull = true
        args       = ["exec", "discord"]
      }
      env {
        BASE_URL     = "${var.environment}.${var.base_url}"
        CORE_URL     = "api.${var.environment}.${var.base_url}"
        LISTEN_PORT  = 443
        SSL          = true
        PROD         = true
        SERVICE_NAME = "SprocketDiscord-%%environment%%"
      }
      template {
        destination = "/secret/.env"
        env         = true
        data        = <<EOF
{{- range service "redis-${var.environment}" }}
REDIS_HOST="{{ .Address }}"
REDIS_PORT="{{ .Port }}"
{{ end }}

{{- range service "lavinmq-${var.environment}" }}
# TODO: Should we set up the rabbitmq vault driver? Does it work with LavinMQ?
AMQP_URL="amqp://{{ .Address }}:{{ .Port }}"
{{ end }}

{{ with secret "kv2/nomad/${var.environment}/creds/discord" }}
AUTH_DISCORD_BOT_TOKEN="{{ .Data.data.botToken }}"
{{ end }}
        EOF
      }
    }
  }

  group "matchmaking" {
    spread {
      attribute = "${node.datacenter}"
    }
    count = 2

    network {
      port "http" {
        to = 3000
      }
    }
    update {
      max_parallel     = 1
      min_healthy_time = "30s"
      healthy_deadline = "5m"
    }

    task "matchmaking" {
      resources {
        memory = 256
        cpu    = 512
      }

      driver = "docker"
      config {
        image      = "${var.monorepo_image}"
        ports      = ["http"]
        force_pull = true
        args       = ["exec", "service", "matchmaking"]
      }

      env {
        BASE_URL       = "${var.environment}.${var.base_url}"
        CORE_URL       = "api.${var.environment}.${var.base_url}"
        LISTEN_PORT    = 443
        SSL            = true
        PROD           = true
        LOGS_NO_BUFFER = true
        LOG_LEVEL      = "debug"
        SERVICE_NAME   = "SprocketMatchmaking-%%environment%%"
      }

      template {
        destination = "/secret/.env"
        env         = true
        data        = <<EOF
{{- range service "redis-${var.environment}" }}
REDIS_HOST="{{ .Address }}"
REDIS_PORT="{{ .Port }}"
{{ end }}

{{- range service "lavinmq-${var.environment}" }}
# TODO: Should we set up the rabbitmq vault driver? Does it work with LavinMQ?
AMQP_URL="amqp://{{ .Address }}:{{ .Port }}"
{{ end }}
        EOF
      }
    }
  }

}