#!/bin/sh
set -eu
: "${WORKPOST_BD_BIN:?Set WORKPOST_BD_BIN to the real bd executable}"
if [ "${1:-}" = "show" ]; then
  exec "$WORKPOST_BD_BIN" "$@" --include-comments
fi
exec "$WORKPOST_BD_BIN" "$@"
