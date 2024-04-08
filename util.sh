#!/usr/bin/env bash
set -e

export VAULT_ADDR=https://vault.spr.ocket.dev

vault_login() {
    if [ -z "${VAULT_TOKEN}" ]; then
        echo "Sign into Sprocket vault"
        SPROCKET_USERNAME=$(gum input --header "What is your RolyPoly username?")
        export VAULT_TOKEN=$(vault login -method ldap -token-only "username=$SPROCKET_USERNAME")
    fi
}

print_db_metadata() {
    export PGHOST=$PG_HOST
    export PGPORT=$PG_PORT
    export PGDATABASE=$PG_DATABASE
    export PGUSER=$PG_USER
    export PGPASSWORD=$PG_PASS

    {
        echo "Search Path"
        psql -c "show search_path"
    } | less

    {
        echo "Public Schema"
        echo "-------------"
        psql -c "SELECT table_catalog, table_schema, table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    } | less

    {
        echo "Sprocket Schema"
        echo "---------------"
        psql -c "SELECT table_catalog, table_schema, table_name FROM information_schema.tables WHERE table_schema = 'sprocket' ORDER BY table_name"
    } | less

    {
        echo "History Schema"
        echo "---------------"
        psql -c "SELECT table_catalog, table_schema, table_name FROM information_schema.tables WHERE table_schema = 'history' ORDER BY table_name"
    } | less
}

deploy_flow() {
    # Build and push container
    gum confirm "Build docker container?" && {
        {
            docker buildx build . --tag ghcr.io/sprocketbot/sprocket:${SPR_ENV} &&
                docker push ghcr.io/sprocketbot/sprocket:${SPR_ENV}
        } || {
            echo "Docker build failed!"
            exit 1
        }
    } || {
        echo "Skipping docker build"
    }

    gum confirm "Deploy to nomad?" && {
        export NOMAD_ADDR=https://nomad.spr.ocket.dev
        # if [ -z $NOMAD_HTTP_AUTH];
        #     export NOMAD_HTTP_AUTH=$SPROCKET_USERNAME:$(gum input --password RolyPoly Password)
        # fi;
        # Sub in the environment where needed.
        # HCL2 has restrictions on where you can have dynamic strings, so we need to use templates
        # Then deploy the job
        # Then remove the temp file
        nomad system reconcile summaries && nomad system gc
        sed nomad.job.hcl -e "s/%%environment%%/${SPR_ENV}/g" >temp.job.hcl
        gum confirm "Review job file before submission?" && {
            bat temp.job.hcl
        }

        nomad job run \
            -var 'base_url=spr.ocket.dev' \
            -var "environment=${SPR_ENV}" \
            -var "monorepo_image=$(docker image inspect ghcr.io/sprocketbot/sprocket:${SPR_ENV} | jq .[0].RepoDigests[0] -r)" \
            temp.job.hcl
        rm temp.job.hcl

        gum confirm "Force reschedule of the job?" && {
            nomad job eval -force-reschedule Sprocket-${SPR_ENV}
        }

        nomad system reconcile summaries && nomad system gc
    } || {
        echo "Skipping nomad deploy"
    }
    # https://ghcr.io/v2/namespaces/sprocketbot/repositories/sprocket/tags

    gum confirm "Execute database migrations?" && {
        vault_login

        DB_CRED=$(vault read database/creds/nomad-sprocket-"$SPR_ENV" -format=json)

        export PG_USER=$(echo "$DB_CRED" | jq .data.username -r)
        export PG_PASS=$(echo "$DB_CRED" | jq .data.password -r)
        export PG_HOST=db.spr.ocket.dev
        export PG_PORT=9696
        export PG_DATABASE=sprocket-"$SPR_ENV"
        export CORE_URL="core.localhost"
        export LISTEN_PORT=4444
        export BASE_URL="localhost"

        gum confirm "Show database metadata (pre-migration)?" && {
            print_db_metadata
        } || {
            echo "Skipping database metadata printout"
        }

        gum confirm "Proceed with migration?" && {
            docker run \
                --user 1000:1000 \
                -v "$(pwd)":/app \
                -v "$(pwd)/.env":/app/core/.env \
                -v "$(pwd)/config.yaml":/app/core/config.yaml \
                -w /app/core \
                -e SERVICE_NAME="SprocketMigrator" \
                -e PG_USER=$PG_USER \
                -e PG_PASS=$PG_PASS \
                -e PG_HOST=$PG_HOST \
                -e PG_PORT=$PG_PORT \
                -e PG_DATABASE=$PG_DATABASE \
                -e PG_CACHE=false \
                -e CORE_URL=$CORE_URL \
                -e LISTEN_PORT=$LISTEN_PORT \
                -e BASE_URL=$BASE_URL \
                oven/bun:alpine \
                bun --preload reflect-metadata -b /app/core/src/datasource.ts up

            gum confirm "Show database metadata (post-migration)?" && {
                print_db_metadata
            } || {
                echo "Skipping database metadata printout"
            }
        } || {
            echo "Migration Cancelled"
        }
    } || {
        echo "Skipping migrations..."
    }
}

database_session() {
    vault_login

    DB_CRED=$(vault read database/creds/nomad-sprocket-"$SPR_ENV" -format=json)

    export PGUSER=$(echo "$DB_CRED" | jq .data.username -r)
    export PGPASSWORD=$(echo "$DB_CRED" | jq .data.password -r)
    export PGHOST=db.spr.ocket.dev
    export PGPORT=9696
    export PGDATABASE=sprocket-"$SPR_ENV"

    psql
}

seed_database() {
    vault_login
    DB_CRED=$(vault read database/creds/nomad-sprocket-"$SPR_ENV" -format=json)
    export PG_USER=$(echo "$DB_CRED" | jq .data.username -r)
    export PG_PASS=$(echo "$DB_CRED" | jq .data.password -r)
    export PG_HOST=db.spr.ocket.dev
    export PG_PORT=9696
    export PG_DATABASE=sprocket-"$SPR_ENV"
    export CORE_URL="core.localhost"
    export LISTEN_PORT=4444
    export BASE_URL="localhost"

    docker run \
        --user 1000:1000 \
        -v "$(pwd)":/app \
        -v "$(pwd)/.env":/app/core/.env \
        -v "$(pwd)/config.yaml":/app/core/config.yaml \
        -w /app/core \
        -e SERVICE_NAME="SprocketSeeder" \
        -e PG_USER=$PG_USER \
        -e PG_PASS=$PG_PASS \
        -e PG_HOST=$PG_HOST \
        -e PG_PORT=$PG_PORT \
        -e PG_CACHE=false \
        -e PG_DATABASE=$PG_DATABASE \
        -e CORE_URL=$CORE_URL \
        -e LISTEN_PORT=$LISTEN_PORT \
        -e BASE_URL=$BASE_URL \
        oven/bun:alpine \
        bun --preload reflect-metadata -b /app/core/src/db/seed.module.ts
}

### Check that gum is installed
shopt -s expand_aliases
command -v gum >/dev/null || {
    ls ~/.bin
    [ -x ~/.bin/gum ] && {
        echo "Found gum at ~/.bin/gum"
        alias gum=~/.bin/gum
    } || {
        echo "gum is not installed, but is required for this script."
        echo "https://github.com/charmbracelet/gum"
        echo "This will extract the binary to ~/.bin/gum"
        echo "If ~/.bin is not on your path, this script will check that location for gum, and automatically use it."
        echo "Install it now?"
        read -r -p "Are you sure? [y/N] " response
        case "$response" in
        [yY][eE][sS] | [yY])
            echo "Installing Gum"
            wget "https://github.com/charmbracelet/gum/releases/download/v0.13.0/gum_0.13.0_$(uname -s)_$(uname -m).tar.gz" -O /tmp/gum.tar.gz
            mkdir -p ~/.bin
            tar -xf /tmp/gum.tar.gz -C ~/.bin gum
            alias gum=~/.bin/gum
            ;;
        *)
            echo "Not installing gum, exiting."
            exit 0
            ;;
        esac
    }
}

command -v vault >/dev/null || {
    echo "Vault CLI is not installed."
    echo "Please follow the instructions available at https://developer.hashicorp.com/vault/install to install the CLI"
    exit 1
}

command -v nomad >/dev/null || {
    echo "Nomad CLI is not installed"
    echo "Please follow the instructions available at https://developer.hashicorp.com/nomad/install to install the CLI"
    exit 1
}

command -v docker >/dev/null || {
    echo "Docker is not installed"
    echo "Please follow the instructions available at to https://docs.docker.com/engine/install/ install Docker"
    exit 1
}

command -v psql >/dev/null || {
    echo "Tthe Postgres cli is not installed"
    echo "Please install the Postgres cli"
    exit 1
}

export SPR_ENV=$(gum choose --header "Environment to work with" "preview")

SELECTED_ACTION=$(gum choose "Deploy Flow" "Connect to Database" "Run Database Seed")

case "$SELECTED_ACTION" in
"Connect to Database")
    database_session
    ;;
"Deploy Flow")
    deploy_flow
    ;;
"Run Database Seed")
    seed_database
    ;;
esac
