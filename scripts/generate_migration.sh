#!/usr/bin/env bash

set -e

NAME=$1

if [ -z "$NAME" ]; then
  echo "❌ Migration name is required"
  echo "👉 Usage: sh scripts/migration.sh <MigrationName>"
  exit 1
fi

echo "🚀 Generating migration: $NAME"

npx typeorm-ts-node-commonjs migration:generate  \
    -d database/data-source.ts   \
    database/migrations/"$NAME"
