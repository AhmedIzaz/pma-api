#!/usr/bin/env bash

set -e

echo "⏪ Reverting last migration..."

npx typeorm-ts-node-commonjs migration:revert \
  -d database/data-source.ts
