#!/bin/sh
set -eu
TEST_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
APP_ROOT=$(dirname "$TEST_ROOT")
export SCOTTY_PROJECTS_FILE="$TEST_ROOT/воркспейс/конфигурация/projects.json"
export SCOTTY_PROJECTS_ROOT="$TEST_ROOT"
export XDG_CONFIG_HOME="$TEST_ROOT/.runtime/config"
export WORKPOST_BD_BIN="${WORKPOST_BD_BIN:-$(command -v bd)}"
export BD_BIN="$TEST_ROOT/воркспейс/инструменты/scotty-bd.sh"
export NEXT_TELEMETRY_DISABLED=1
cd "$APP_ROOT"
exec npm run start -- --hostname 127.0.0.1 --port "${SCOTTY_TEST_PORT:-3000}"
