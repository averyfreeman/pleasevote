#!/usr/bin/env bash
set -euo pipefail

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

check_toolchain() {
  local node_version node_major pnpm_version go_version go_major go_minor

  require_command node
  require_command pnpm
  require_command go

  node_version="$(node --version)"
  if [[ ! "$node_version" =~ ^v([0-9]+)\. ]]; then
    echo "Could not determine the Node.js toolchain version from: $node_version" >&2
    exit 1
  fi
  node_major="${BASH_REMATCH[1]}"
  if (( node_major < 24 )); then
    echo "Node 24 or newer is required; found $node_version" >&2
    exit 1
  fi

  pnpm_version="$(pnpm --version)"
  if [[ ! "$pnpm_version" =~ ^12\. ]]; then
    echo "pnpm 12 is required; found $pnpm_version" >&2
    exit 1
  fi

  go_version="$(go version)"
  if [[ ! "$go_version" =~ go([0-9]+)\.([0-9]+) ]]; then
    echo "Could not determine the Go toolchain version from: $go_version" >&2
    exit 1
  fi
  go_major="${BASH_REMATCH[1]}"
  go_minor="${BASH_REMATCH[2]}"
  if (( go_major != 1 || go_minor < 24 )); then
    echo "Go 1.24 or newer is required; found $go_version" >&2
    exit 1
  fi
}

check_repository_artifacts() {
  local required_artifact
  for required_artifact in \
    companion/openapi.yaml \
    companion/schema.sql \
    Dockerfile \
    companion/Dockerfile \
    compose.yaml \
    .github/workflows/ci.yml; do
    if [[ ! -s "$required_artifact" ]]; then
      echo "Required release artifact is missing or empty: $required_artifact" >&2
      exit 1
    fi
  done
}

check_toolchain
check_repository_artifacts

verification_tmp="$(mktemp -d "${TMPDIR:-/tmp}/pleasevote-verify.XXXXXX")"
trap 'rm -rf "$verification_tmp"' EXIT
export GOCACHE="$verification_tmp/go-build"

git diff --check

if [[ -f pnpm-lock.yaml ]]; then
  browser_project="${PLEASEVOTE_BROWSER_PROJECT:-chromium}"
  pnpm run copy:check
  pnpm run contract:check
  pnpm run typecheck
  pnpm run test:unit:coverage
  pnpm exec playwright test tests/scenarios.spec.ts --project="$browser_project"
  pnpm exec playwright test tests/accessibility.spec.ts --project="$browser_project"
  pnpm run build
  pnpm run docs:build
fi

if [[ -f go.mod ]]; then
  pnpm run api:verify
  go test -race ./companion/...
  go vet ./companion/...
fi
