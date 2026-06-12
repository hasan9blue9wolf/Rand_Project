import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { buildAiAdvisorFallbackResponses } from "../features/aiAdvisor/services/ai-advisor.fallback";
import { buildAiAdvisorPromptBundle } from "../features/aiAdvisor/services/ai-advisor.prompt-builder";
import {
  aiAdvisorBackendRequestSchema,
  aiAdvisorStructuredResponseEnvelopeSchema,
} from "../features/aiAdvisor/services/ai-advisor.schemas";
import type {
  AiAdvisorBackendErrorCode,
  AiAdvisorBackendErrorResponse,
  AiAdvisorBackendSuccessResponse,
  AiAdvisorStructuredContext,
  AiAdvisorStructuredResponseEnvelope,
} from "../features/aiAdvisor/types";
import { consumeHeiaRateLimit } from "./_lib/heia-rate-limit";
import {
  createHeiaRateLimitIdentifier,
  createHeiaRequestId,
  getHeiaRuntimeConfig,
} from "./_lib/heia-runtime";

export const config = {
  runtime: "edge",
};

const HEIA_PROVIDER_NAME = "hayatrip-heia";

const sleep = (timeoutMs: number) =>
  new Promise((resolve) => setTimeout(resolve, timeoutMs));

const buildJsonResponse = (
  body: unknown,
  {
    requestId,
    ...init
  }: ResponseInit & {
    requestId: string;
  },
) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "Referrer-Policy": "no-referrer",
      Vary: "Accept-Language",
      "X-Content-Type-Options": "nosniff",
      "X-Request-Id": requestId,
      ...init.headers,
    },
  });

const buildErrorBody = ({
  code,
  fallbackResponses,
  message,
  requestId,
  retryAfterSeconds,
  status,
}: {
  code: AiAdvisorBackendErrorCode;
  fallbackResponses?: AiAdvisorBackendErrorResponse["fallbackResponses"];
  message: string;
  requestId: string;
  retryAfterSeconds?: number;
  status: number;
}) =>
  buildJsonResponse(
    {
      code,
      ...(fallbackResponses ? { fallbackResponses } : {}),
      message,
      ok: false,
      providerName: HEIA_PROVIDER_NAME,
      ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
    } satisfies AiAdvisorBackendErrorResponse,
    {
      requestId,
      status,
      ...(retryAfterSeconds
        ? {
            headers: {
              "Retry-After": String(retryAfterSeconds),
            },
          }
        : {}),
    },
  );

const getErrorStatus = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "status" in error &&
  typeof error.status === "number"
    ? error.status
    : undefined;

const shouldRetryOpenAIError = (status: number | undefined) =>
  status === 408 ||
  status === 409 ||
  status === 429 ||
  (status !== undefined && status >= 500);

const createTimeoutSignal = (timeoutMs: number) => AbortSignal.timeout(timeoutMs);

const requestOpenAIResponses = async ({
  client,
  input,
  instructions,
  model,
  timeoutMs,
}: {
  client: OpenAI | null;
  input: string;
  instructions: string;
  model: string;
  timeoutMs: number;
}) => {
  if (!client) {
    throw new Error("AI provider is unavailable.");
  }

  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await client.responses.parse(
        {
          input,
          instructions,
          model,
          text: {
            format: zodTextFormat(
              aiAdvisorStructuredResponseEnvelopeSchema,
              "heia_response_envelope",
            ),
          },
        },
        {
          signal: createTimeoutSignal(timeoutMs),
        },
      );
    } catch (error) {
      lastError = error;

      if (!shouldRetryOpenAIError(getErrorStatus(error)) || attempt === 1) {
        break;
      }

      await sleep(350 * (attempt + 1));
    }
  }

  throw lastError;
};

export default async function handler(request: Request): Promise<Response> {
  const runtimeConfig = getHeiaRuntimeConfig();
  const requestId = createHeiaRequestId(request);
  const client = runtimeConfig.openAiApiKey
    ? new OpenAI({ apiKey: runtimeConfig.openAiApiKey })
    : null;

  if (request.method !== "POST") {
    return buildJsonResponse(
      {
        message: "Method not allowed.",
        ok: false,
      },
      {
        headers: {
          Allow: "POST",
        },
        requestId,
        status: 405,
      },
    );
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("application/json")) {
    return buildErrorBody({
      code: "bad_request",
      message: "Requests must use a JSON body.",
      requestId,
      status: 415,
    });
  }

  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return buildErrorBody({
      code: "bad_request",
      message: "Invalid JSON request body.",
      requestId,
      status: 400,
    });
  }

  const parsedRequest = aiAdvisorBackendRequestSchema.safeParse(requestBody);

  if (!parsedRequest.success) {
    return buildErrorBody({
      code: "bad_request",
      message: "The request could not be processed.",
      requestId,
      status: 400,
    });
  }

  const requestData = parsedRequest.data;
  const fallbackResponses = buildAiAdvisorFallbackResponses({
    locale: requestData.locale,
    memorySummary: requestData.structuredContext.userIntentSummary,
  });
  const rateLimit = consumeHeiaRateLimit({
    identifier: await createHeiaRateLimitIdentifier(request),
    maxRequests: runtimeConfig.rateLimitMaxRequests,
    windowMs: runtimeConfig.rateLimitWindowMs,
  });

  if (!rateLimit.allowed) {
    return buildErrorBody({
      code: "rate_limited",
      fallbackResponses,
      message:
        requestData.locale === "ar"
          ? "تم الوصول إلى الحد المؤقت. حاول مرة أخرى بعد لحظات."
          : "Too many requests were sent. Please retry shortly.",
      requestId,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
      status: 429,
    });
  }

  if (!client) {
    return buildErrorBody({
      code: "misconfigured",
      fallbackResponses,
      message:
        requestData.locale === "ar"
          ? "خدمة هيا غير متاحة حالياً. أعرض لك بديلاً آمناً مؤقتاً."
          : "Heia is temporarily unavailable. Returning a safe fallback for now.",
      requestId,
      status: 503,
    });
  }

  const prompt = buildAiAdvisorPromptBundle({
    latestUserMessage: requestData.latestUserMessage,
    locale: requestData.locale,
    recentConversation: requestData.recentConversation,
    structuredContext: requestData.structuredContext as AiAdvisorStructuredContext,
    templateId: requestData.templateId,
  });

  try {
    const openAIResponse = await requestOpenAIResponses({
      client,
      input: prompt.user,
      instructions: prompt.system,
      model: runtimeConfig.model,
      timeoutMs: runtimeConfig.timeoutMs,
    });
    const parsedOutput = (openAIResponse.output_parsed ?? {
      responses: fallbackResponses,
    }) as AiAdvisorStructuredResponseEnvelope;

    return buildJsonResponse(
      {
        ok: true,
        providerName: HEIA_PROVIDER_NAME,
        requestId: openAIResponse.id ?? requestId,
        responses: parsedOutput.responses,
        templateId: requestData.templateId,
      } satisfies AiAdvisorBackendSuccessResponse,
      {
        headers: {
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
        requestId,
        status: 200,
      },
    );
  } catch (error) {
    const status = getErrorStatus(error);
    const code: AiAdvisorBackendErrorCode =
      error instanceof Error && error.name === "AbortError"
        ? "timeout"
        : status === 429
          ? "rate_limited"
          : status !== undefined && status >= 500
            ? "service_unavailable"
            : "upstream_error";

    return buildErrorBody({
      code,
      fallbackResponses,
      message:
        requestData.locale === "ar"
          ? "تعذر الوصول إلى هيا حالياً. أعرض لك بديلاً آمناً ومفيداً مؤقتاً."
          : "Heia is unavailable right now. Returning a safe fallback instead.",
      requestId,
      status: status === 429 ? 429 : 503,
      ...(status === 429
        ? {
            retryAfterSeconds: rateLimit.retryAfterSeconds,
          }
        : {}),
    });
  }
}
