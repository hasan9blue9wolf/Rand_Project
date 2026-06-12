import {
  describe,
  expect,
  it,
} from "@jest/globals";

import { buildPublicRuntimeConfig } from "../public-config.shared";

describe("buildPublicRuntimeConfig", () => {
  it("drops insecure production values and secret-like public keys", () => {
    const config = buildPublicRuntimeConfig({
      apiBaseUrl: "http://internal.hayatrip.local",
      appEnv: "production",
      appMode: "live",
      supabasePublishableKey: "sb_secret_server_only_key",
      supabaseUrl: "http://project.supabase.co",
    });

    expect(config).toEqual({
      apiBaseUrl: "https://api.hayatrip.app",
      appEnv: "production",
      appMode: "live",
      appVariant: "production",
      releaseChannel: "production",
      supabasePublishableKey: "",
      supabaseUrl: "",
    });
  });

  it("allows local development api urls while normalizing defaults", () => {
    const config = buildPublicRuntimeConfig({
      apiBaseUrl: "http://192.168.1.24:8081/",
      appEnv: "development",
      appMode: "invalid",
      supabasePublishableKey: "sb_publishable_demo_key",
      supabaseUrl: "https://demo.supabase.co/",
    });

    expect(config).toEqual({
      apiBaseUrl: "http://192.168.1.24:8081",
      appEnv: "development",
      appMode: "demo",
      appVariant: "development",
      releaseChannel: "development",
      supabasePublishableKey: "sb_publishable_demo_key",
      supabaseUrl: "https://demo.supabase.co",
    });
  });
});
