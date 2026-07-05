# Haya secure backend

Node.js 20+ service for the Haya Trips mobile app. It uses the OpenAI Responses API with strict inventory tools and validates every returned catalog ID. When the key or upstream service is unavailable it returns a deterministic local/demo response.

## Run

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Set `OPENAI_API_KEY` only in `server/.env` locally or in the backend host's secret manager. Never expose it through Expo. `OPENAI_MODEL` defaults to `gpt-5.4-mini`.

The mobile app should use its public backend base URL and call `POST /api/haya/chat`; it must never receive the OpenAI key.
