# ADR 0005: Standardize frontend work on Node 24 and pnpm

- Status: accepted
- Date: 2026-09-29

## Context

The repository accumulated Bun and npm artifacts, while the desired deployment and tests need a predictable current LTS Node toolchain. The package manager should be explicit and lockfile-driven.

## Decision

Use Node 24 LTS and pnpm 12 with a workspace lockfile. Remove Bun and npm lock/tooling from the repository, set strict engine and peer-dependency checks, and make verification run through one documented pnpm command.

## Consequences

Contributor setup is conventional and reproducible. Native Go remains the runtime API server; Node is the frontend build/test/docs toolchain, not the provider backend.

