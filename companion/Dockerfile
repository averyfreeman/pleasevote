# syntax=docker/dockerfile:1.7

FROM golang:1.24.0-bookworm AS companion-build
WORKDIR /workspace

COPY go.mod go.sum ./
RUN go mod download
COPY companion ./companion
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags='-s -w' -o /out/pleasevote-companion ./companion/cmd/pleasevote-companion

FROM gcr.io/distroless/static-debian12:nonroot

LABEL org.opencontainers.image.title="PleaseVote consent companion"
LABEL org.opencontainers.image.description="Intake-only consent service with no voter lookup linkage"

COPY --from=companion-build /out/pleasevote-companion /pleasevote-companion

ENV PLEASEVOTE_COMPANION_ADDR=:8081
EXPOSE 8081
USER nonroot:nonroot
ENTRYPOINT ["/pleasevote-companion"]
