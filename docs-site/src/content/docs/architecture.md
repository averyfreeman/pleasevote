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

The provider layer is server-side and time-bounded. The client owns presentation and deterministic domain operations. A stable contract allows a future Rust/WASM module without changing the visitor workflow; WASM is not required for the current deployment.

The companion consent intake is a separate deployment and schema. It is not connected to lookup addresses, political preference, or PleaseVote analytics.
