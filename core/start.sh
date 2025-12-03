#!/bin/sh
# wait for postgres to be ready
until pg_isready -h postgres -p 5432 -U sprocketbot; do
  echo "Waiting for postgres..."
  sleep 2
done

# run the original command
exec node dist/main.js
