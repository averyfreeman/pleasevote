---
title: Architecture
description: Ownership boundaries and the path from address to voting plan.
---

```mermaid
flowchart LR
  A[Visitor address] --> B[React Router SPA]
  B --> C[Go /api/v1]
  C --> D[Google Maps geocoding]
  C --> E[Google Civic API]
  C --> F[OpenAPI envelope]
  F --> G[TypeScript radius + aggregation]
  G --> H[Accessible voting plan + print view]
```

The Go service talks to Google with bounded requests. The client handles presentation and distance calculations. The OpenAPI contract leaves room for a future Rust/WASM module; WASM is not needed for the current deployment.

The consent companion is a separate service and schema. It is not connected to lookup addresses, political preferences, or PleaseVote analytics.
