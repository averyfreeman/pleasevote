#!/usr/bin/env bash
set -euo pipefail

git diff --check

if [[ -f pnpm-lock.yaml ]]; then
  pnpm run typecheck
  pnpm run test:unit -- --run
  pnpm run build
fi

if [[ -f go.mod ]]; then
  go test ./...
  go vet ./...
fi

if [[ -f docs-site/package.json && -f pnpm-lock.yaml ]]; then
  pnpm --filter pleasevote-docs build
fi
