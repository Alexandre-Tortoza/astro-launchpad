#!/usr/bin/env bash
set -euo pipefail

compose_file="${COMPOSE_FILE:-compose.yml}"
docker compose -f "$compose_file" up -d --build
