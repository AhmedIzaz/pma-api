#!/usr/bin/env bash

set -e

echo "🚀 Running pending migrations..."

npx typeorm-ts-node-commonjs migration:run \
  -d database/data-source.ts
