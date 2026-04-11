# HackHorizon InvoiceSync

Production-grade GST invoice reconciliation platform with blockchain anchoring, realtime dashboard updates, and GST return generation.

## Architecture

- Frontend: React + Vite (client)
- Backend: Express + Passport sessions + MongoDB (server)
- Blockchain: Solidity contract via Hardhat (blockchain)

## Prerequisites

- Node.js 20+
- MongoDB (Atlas recommended)
- RPC endpoint + funded signer for on-chain anchoring

## Environment Variables

Use server/.env.example as template.

Required in all modes:

- MONGO_URI

Required in production:

- SESSION_SECRET
- CLIENT_URL
- RPC_URL
- PRIVATE_KEY
- CONTRACT_ADDRESS

## Local Development

1. Install backend deps:

```bash
cd server
npm install
```

2. Install frontend deps:

```bash
cd ../client
npm install
```

3. Start backend:

```bash
cd ../server
npm run dev
```

4. Start frontend:

```bash
cd ../client
npm run dev
```

## Production Deployment Checklist

1. Configure environment variables from server/.env.example.
2. Use a strong SESSION_SECRET (>= 32 bytes random).
3. Ensure MongoDB is reachable from server runtime.
4. Set CLIENT_URL to your frontend origin(s), comma-separated if needed.
5. Set NODE_ENV=production.
6. Verify blockchain RPC/signing keys are production keys.
7. Enable HTTPS at the edge (required for secure cookies).
8. Confirm /healthz responds 200.
9. Run build and tests before release.

## Healthcheck

- Endpoint: GET /healthz
- Expected: 200 { "success": true, "status": "ok" }

## Testing

Backend unit tests:

```bash
cd server
npm test
```

Auth smoke test (requires running backend):

```bash
cd server
npm run test:auth
```

Frontend build validation:

```bash
cd client
npm run build
```

## Security Notes

- Sessions are persisted in MongoDB store for production-safe scaling.
- API/auth/write rate limits are enabled.
- Helmet with CSP is enabled by default.
- Server validates critical env vars at startup.

## Rollback Plan

1. Keep previous backend and frontend build artifacts.
2. Roll back deployment to prior artifact if healthcheck or auth fails.
3. Re-run smoke checks:
- /healthz
- login/register
- invoice create/update
- GST return generate/export