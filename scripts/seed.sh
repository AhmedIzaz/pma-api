#!/usr/bin/env bash

set -e

echo "🚀 Seeding started..."


npx ts-node -r tsconfig-paths/register database/seeders/index.ts
