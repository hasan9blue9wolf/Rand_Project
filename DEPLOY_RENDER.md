# Deploy the Haya Trips backend on Render Free

Deploy repository `hasan9blue9wolf/Rand_Project` from branch `clean-render-deploy`. Use either a Render **Blueprint** with the root `render.yaml`, or create a **Web Service** with these settings:

- Branch: `clean-render-deploy`
- Root Directory: `server`
- Runtime: `Node`
- Build Command: `npm ci --include=dev && npm run build`
- Start Command: `npm start`
- Health Check Path: `/health`
- Instance Type: `Free`

## Environment variables

The Blueprint configures the non-secret production defaults. If creating the service manually, configure:

- `OPENAI_API_KEY`: enter the secret manually in the Render dashboard
- `OPENAI_MODEL`: `gpt-5.4-mini`
- `NODE_ENV`: `production`
- `ALLOWED_ORIGINS`: optional comma-separated browser origins; native React Native requests do not send an Origin header
- `RATE_LIMIT_MAX`: `30`
- `RATE_LIMIT_WINDOW_MS`: `60000`
- `MAX_OUTPUT_TOKENS`: `700`

Render supplies `PORT`; do not add it. Never expose `OPENAI_API_KEY` in Git, Render Blueprint values, Expo/EAS configuration, mobile code, documentation, tests, or logs.

## Verify the deployment

Replace the example host with the Render service URL:

```sh
curl https://haya-trips-api.onrender.com/health
```

The chat request must match the backend Zod schema. This minimal valid request uses the deterministic fallback when OpenAI is unavailable:

```sh
curl -X POST https://haya-trips-api.onrender.com/api/haya/chat \
  -H 'Content-Type: application/json' \
  --data '{"message":"Find a family trip from Baghdad to Dubai for 4 travelers, budget 3000 USD, for 7 days","locale":"en","conversationId":"render-smoke-test","history":[],"preferences":{"departureCity":null,"destinationInterests":[],"budgetMin":null,"budgetMax":null,"currency":null,"durationDays":null,"departureDate":null,"returnDate":null,"dateFlexibility":null,"travelers":null,"adults":null,"children":null,"tripType":null,"luxuryLevel":null,"cabinClass":null,"directFlightPreferred":null,"visaPreference":null,"specialPreferences":[]}}'
```

Render Free services may sleep when idle, so the first request can be slow. Before the competition, open the `/health` URL and confirm an HTTP 200 response early enough for the service to wake. Then run the chat smoke test above. Keep the API key only in Render's secret environment-variable field.
