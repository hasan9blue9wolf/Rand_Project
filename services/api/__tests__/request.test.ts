import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { z } from "zod";

import {
  ApiRequestError,
  requestJson,
  requestJsonWithSchema,
} from "../request";

describe("requestJson", () => {
  const originalFetch = global.fetch;
  const originalNavigator = global.navigator;

  beforeEach(() => {
    Object.defineProperty(global, "fetch", {
      configurable: true,
      value: jest.fn<typeof fetch>(),
    });
    Object.defineProperty(global, "navigator", {
      configurable: true,
      value: {
        onLine: true,
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(global, "fetch", {
      configurable: true,
      value: originalFetch,
    });

    if (originalNavigator) {
      Object.defineProperty(global, "navigator", {
        configurable: true,
        value: originalNavigator,
      });
      return;
    }

    Reflect.deleteProperty(global, "navigator");
  });

  it("returns safe http error messages while preserving server request ids", async () => {
    const fetchMock = global.fetch as jest.MockedFunction<typeof fetch>;

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "Detailed upstream error" }), {
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": "req_123",
        },
        status: 500,
      }),
    );

    await expect(
      requestJson({
        path: "/api/heia",
        retryCount: 0,
      }),
    ).rejects.toMatchObject({
      message:
        "The service is temporarily unavailable. Please try again shortly.",
      requestId: "req_123",
      status: 500,
    } satisfies Partial<ApiRequestError>);
  });

  it("validates structured responses through the shared request abstraction", async () => {
    const fetchMock = global.fetch as jest.MockedFunction<typeof fetch>;

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
      }),
    );

    await expect(
      requestJsonWithSchema({
        method: "GET",
        path: "/health",
        responseSchema: z.object({
          ok: z.literal(true),
        }),
      }),
    ).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.hayatrips.app/health",
      expect.objectContaining({
        credentials: "omit",
        method: "GET",
      }),
    );
  });
});
