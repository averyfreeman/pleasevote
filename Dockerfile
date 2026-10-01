# syntax=docker/dockerfile:1.7

FROM node:24.21.0-bookworm-slim AS frontend-build
WORKDIR /workspace

RUN npm install --global pnpm@12.6.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY docs-site/package.json docs-site/package.json
RUN pnpm install --frozen-lockfile

COPY app ./app
COPY react-router.config.ts tsconfig.json vite.config.ts ./
RUN pnpm run build

FROM golang:1.24.0-bookworm AS api-build
WORKDIR /workspace

COPY go.mod go.sum ./
RUN go mod download
COPY server ./server
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags='-s -w' -o /out/pleasevote-api ./server/cmd/pleasevote-api

FROM gcr.io/distroless/static-debian12:nonroot

LABEL org.opencontainers.image.title="PleaseVote provider service"
LABEL org.opencontainers.image.description="Credential-free voter information API and static frontend"

COPY --from=api-build /out/pleasevote-api /pleasevote-api
COPY --from=frontend-build /workspace/build/client /app/build/client

ENV PLEASEVOTE_ADDR=:8080
ENV PLEASEVOTE_STATIC_DIR=/app/build/client
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/pleasevote-api"]
