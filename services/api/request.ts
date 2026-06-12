import type { ZodType } from "zod";

import { getApiBaseUrl } from "./runtime";

type ApiRequestMethod = "GET" | "POST";

type ApiRequestOptions = {
  body?: unknown;
  headers?: Record<string, string>;
  method?: ApiRequestMethod;
  path: string;
  retryCount?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
};

type ApiSchemaRequestOptions<T> = ApiRequestOptions & {
  responseSchema: ZodType<T>;
};

type ApiErrorOptions = {
  code: string;
  data?: unknown;
  message: string;
  requestId?: string;
  retryAfterMs?: number;
  status?: number;
};

export class ApiRequestError extends Error {
  code: string;
  data: unknown;
  requestId: string | undefined;
  retryAfterMs: number | undefined;
  status: number | undefined;

  constructor({
    code,
    data,
    message,
    requestId,
    retryAfterMs,
    status,
  }: ApiErrorOptions) {
    super(message);
    this.code = code;
    this.data = data;
    this.name = "ApiRequestError";
    this.requestId = requestId;
    this.retryAfterMs = retryAfterMs;
    this.status = status;
  }
}

const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const DEFAULT_RETRY_DELAY_MS = 600;
const MAX_RETRY_DELAY_MS = 4_000;
const NETWORK_ERROR_PATTERNS = [
  /failed to fetch/i,
  /load failed/i,
  /network request failed/i,
  /network error/i,
  /timed out/i,
  /timeout/i,
] as const;

const parseResponseBody = async (response: Response) => {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    return responseText;
  }
};

const wait = async (durationMs: number) => {
  await new Promise((resolve) => setTimeout(resolve, durationMs));
};

const isNavigatorOffline = () =>
  typeof navigator !== "undefined" &&
  "onLine" in navigator &&
  navigator.onLine === false;

const parseRetryAfterMs = (retryAfterHeader: string | null) => {
  if (!retryAfterHeader) {
    return undefined;
  }

  const asSeconds = Number(retryAfterHeader);

  if (Number.isFinite(asSeconds)) {
    return Math.max(0, asSeconds * 1000);
  }

  const asDate = Date.parse(retryAfterHeader);

  if (Number.isNaN(asDate)) {
    return undefined;
  }

  return Math.max(0, asDate - Date.now());
};

const normalizeApiPath = (path: string) =>
  path.startsWith("/") ? path : `/${path}`;

const createClientRequestId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `tg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const getSafeHttpErrorMessage = (status: number) => {
  if (status === 401 || status === 403) {
    return "Your session is no longer valid. Please sign in again.";
  }

  if (status === 408) {
    return "The request took too long. Please try again.";
  }

  if (status === 429) {
    return "Too many requests were sent. Please wait a moment and retry.";
  }

  if (status >= 500) {
    return "The service is temporarily unavailable. Please try again shortly.";
  }

  return "The request could not be completed. Please try again.";
};

export const isWeakNetworkError = (error: unknown) => {
  if (error instanceof ApiRequestError) {
    return (
      error.code === "network_error" ||
      error.code === "offline" ||
      error.code === "timeout"
    );
  }

  return (
    error instanceof Error &&
    NETWORK_ERROR_PATTERNS.some((pattern) => pattern.test(error.message))
  );
};

export const isRetryableApiRequestError = (error: unknown) => {
  if (error instanceof ApiRequestError) {
    return (
      isWeakNetworkError(error) ||
      (typeof error.status === "number" &&
        RETRYABLE_STATUS_CODES.has(error.status))
    );
  }

  return isWeakNetworkError(error);
};

export const getApiRetryDelayMs = (error: unknown, attemptIndex: number) => {
  if (
    error instanceof ApiRequestError &&
    typeof error.retryAfterMs === "number"
  ) {
    return Math.min(error.retryAfterMs, MAX_RETRY_DELAY_MS);
  }

  const exponentialDelay = DEFAULT_RETRY_DELAY_MS * 2 ** attemptIndex;
  return Math.min(exponentialDelay, MAX_RETRY_DELAY_MS);
};

const toApiRequestError = (error: unknown) => {
  if (error instanceof ApiRequestError) {
    return error;
  }

  if (isNavigatorOffline()) {
    return new ApiRequestError({
      code: "offline",
      message: "No network connection is available right now.",
    });
  }

  if (error instanceof Error && error.name === "AbortError") {
    return new ApiRequestError({
      code: "timeout",
      message: "The request took too long. Please try again.",
    });
  }

  return new ApiRequestError({
    code: "network_error",
    message: "The network request failed. Please try again.",
  });
};

export async function requestJson<T>({
  body,
  headers,
  method = "POST",
  path,
  retryCount = 1,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
  timeoutMs = 12_000,
}: ApiRequestOptions): Promise<T> {
  if (method === "GET" && body !== undefined) {
    throw new ApiRequestError({
      code: "invalid_request",
      message: "The request could not be prepared.",
    });
  }

  const normalizedPath = normalizeApiPath(path);

  for (let attemptIndex = 0; attemptIndex <= retryCount; attemptIndex += 1) {
    const clientRequestId = createClientRequestId();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      if (isNavigatorOffline()) {
        throw new ApiRequestError({
          code: "offline",
          message: "No network connection is available right now.",
        });
      }

      const response = await fetch(`${getApiBaseUrl()}${normalizedPath}`, {
        credentials: "omit",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Client-Request-Id": clientRequestId,
          "X-Requested-With": "hayatrip-mobile",
          ...headers,
        },
        method,
        signal: controller.signal,
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const responseData = await parseResponseBody(response);
      const responseRequestId =
        response.headers.get("x-request-id") ??
        response.headers.get("x-vercel-id") ??
        clientRequestId;

      if (!response.ok) {
        const retryAfterMs = parseRetryAfterMs(
          response.headers.get("retry-after"),
        );

        throw new ApiRequestError({
          code: `http_${response.status}`,
          data: responseData,
          message: getSafeHttpErrorMessage(response.status),
          requestId: responseRequestId,
          ...(typeof retryAfterMs === "number" ? { retryAfterMs } : {}),
          status: response.status,
        });
      }

      return responseData as T;
    } catch (error) {
      const apiError = toApiRequestError(error);

      if (attemptIndex >= retryCount || !isRetryableApiRequestError(apiError)) {
        throw apiError;
      }

      await wait(
        Math.max(retryDelayMs, getApiRetryDelayMs(apiError, attemptIndex)),
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new ApiRequestError({
    code: "network_error",
    message: "The network request failed. Please try again.",
  });
}

export async function requestJsonWithSchema<T>({
  responseSchema,
  ...options
}: ApiSchemaRequestOptions<T>): Promise<T> {
  const response = await requestJson<unknown>(options);

  return responseSchema.parse(response) as T;
}
