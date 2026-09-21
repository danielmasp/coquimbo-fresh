# Coquimbo Fresh

**Ordering and agro-logistics workflow for a seasonal produce operation.**

Coquimbo Fresh operated in Santiago, Chile from 2019 to 2024. This repository is a portfolio reconstruction of the documented workflow, not a claim that this is the original historical source code.

The operation served **150+ retail customers, 10 restaurants, and 15+ wholesale resellers**. During its three-month annual season, it dispatched approximately **4,500 lbs of produce per month** and reduced perishable spoilage by at least **15%**.

## What this reconstruction demonstrates

- A web ordering portal that centralizes weekly supply requests
- Order intake for retail, restaurant, and wholesale accounts
- Automatic batching by geographic cluster
- Dispatch priority based on product freshness constraints and intake time
- A clear handoff from scheduling to the documented Circuit route-planning workflow

The orders shown in the application are synthetic demo records. Historical scale and outcome metrics are labeled separately.

## Scheduling policy

The scheduling engine is deterministic and testable:

1. Group incoming requests by geographic cluster.
2. Within each cluster, prioritize the strictest freshness constraint.
3. Break equal-priority ties by intake time.
4. Rank dispatch clusters by their highest-priority request.

This mirrors the documented business rule without inventing a Circuit API integration or a proprietary optimization model.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. Add or remove orders and watch the dispatch plan recompute immediately.

## Verification

```bash
npm test
npm run build
```

Tests cover geographic grouping, freshness priority, stable sequencing, volume totals, and the empty-queue case.

## Implementation

- React + Vite interface
- Pure JavaScript scheduling engine
- Responsive HTML/CSS operations dashboard
- Node's built-in test runner

No customer identities, production data, credentials, or private operational records are included.
