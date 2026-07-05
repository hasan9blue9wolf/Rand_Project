import type { AppConfig } from "../../types/env";
import { getPublicRuntimeConfig } from "../runtime/public-config";

export const getApiRuntimeConfig = (): Pick<AppConfig, "apiBaseUrl" | "appEnv"> => {
  const { apiBaseUrl, appEnv } = getPublicRuntimeConfig();

  return {
    apiBaseUrl,
    appEnv,
  };
};

export const getApiBaseUrl = () => getApiRuntimeConfig().apiBaseUrl.replace(/\/$/, "");
