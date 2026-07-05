const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 12;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_MODEL = "gpt-4.1-mini";

const clampInteger = ({
  fallbackValue,
  max,
  min,
  value,
}: {
  fallbackValue: number;
  max: number;
  min: number;
  value: string | null | undefined;
}) => {
  const parsedValue = Number(value ?? "");

  if (!Number.isFinite(parsedValue)) {
    return fallbackValue;
  }

  return Math.min(max, Math.max(min, Math.trunc(parsedValue)));
};

const trimValue = (value?: string | null) => value?.trim() ?? "";

const sanitizeRequestId = (value: string | null | undefined) => {
  const trimmed = trimValue(value).replace(/[^a-zA-Z0-9._-]/g, "");

  return trimmed.slice(0, 64);
};

const toHex = (value: ArrayBuffer) =>
  Array.from(new Uint8Array(value))
    .map((chunk) => chunk.toString(16).padStart(2, "0"))
    .join("");

const buildClientFingerprint = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const directAddress =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("user-agent") ||
    "anonymous";

  return directAddress.slice(0, 256);
};

export const getHeiaRuntimeConfig = () => ({
  model: trimValue(process.env["OPENAI_HEIA_MODEL"]) || DEFAULT_MODEL,
  openAiApiKey: trimValue(process.env["OPENAI_API_KEY"]),
  rateLimitMaxRequests: clampInteger({
    fallbackValue: DEFAULT_RATE_LIMIT_MAX_REQUESTS,
    max: 60,
    min: 1,
    value: process.env["HEIA_RATE_LIMIT_MAX_REQUESTS"],
  }),
  rateLimitWindowMs: clampInteger({
    fallbackValue: DEFAULT_RATE_LIMIT_WINDOW_MS,
    max: 300_000,
    min: 10_000,
    value: process.env["HEIA_RATE_LIMIT_WINDOW_MS"],
  }),
  timeoutMs: clampInteger({
    fallbackValue: DEFAULT_TIMEOUT_MS,
    max: 30_000,
    min: 3_000,
    value: process.env["OPENAI_HEIA_TIMEOUT_MS"],
  }),
});

export const createHeiaRequestId = (request: Request) =>
  sanitizeRequestId(
    request.headers.get("x-client-request-id") ??
      request.headers.get("x-request-id"),
  ) || crypto.randomUUID();

export const createHeiaRateLimitIdentifier = async (request: Request) => {
  const fingerprint = buildClientFingerprint(request);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(fingerprint),
  );

  return toHex(digest).slice(0, 32);
};
