import {
  ApiRequestError,
  requestJsonWithSchema,
} from "../../../services/api/request";
import type {
  AiAdvisorBackendErrorResponse,
  AiAdvisorBackendRequest,
  AiAdvisorBackendSuccessResponse,
} from "../types";
import {
  aiAdvisorBackendErrorResponseSchema,
  aiAdvisorBackendSuccessResponseSchema,
} from "./ai-advisor.schemas";

const HEIA_API_PATH = "/api/heia";

export const requestHeiaBackend = async ({
  body,
  language,
}: {
  body: AiAdvisorBackendRequest;
  language: AiAdvisorBackendRequest["locale"];
}): Promise<AiAdvisorBackendSuccessResponse> => {
  try {
    const response = await requestJsonWithSchema({
      body,
      headers: {
        "Accept-Language": language,
      },
      path: HEIA_API_PATH,
      responseSchema: aiAdvisorBackendSuccessResponseSchema,
      retryCount: 2,
      timeoutMs: 12_000,
    });
    const { requestId, ...restResponse } = response;

    return {
      ...restResponse,
      ...(requestId ? { requestId } : {}),
    } as AiAdvisorBackendSuccessResponse;
  } catch (error) {
    if (error instanceof ApiRequestError && error.data !== undefined) {
      const parsedError = aiAdvisorBackendErrorResponseSchema.safeParse(error.data);

      if (parsedError.success) {
        const backendError = parsedError.data as AiAdvisorBackendErrorResponse;

        throw new ApiRequestError({
          code: backendError.code,
          data: backendError,
          message: backendError.message,
          ...(error.requestId ? { requestId: error.requestId } : {}),
          ...(typeof error.status === "number" ? { status: error.status } : {}),
        });
      }
    }

    throw error;
  }
};
