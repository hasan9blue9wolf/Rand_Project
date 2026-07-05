export type AppEnvironment = "development" | "staging" | "production";
export type AppVariant = AppEnvironment;
export type AppMode = "demo" | "live";

export type AppConfig = {
  appEnv: AppEnvironment;
  appMode: AppMode;
  appVariant: AppVariant;
  apiBaseUrl: string;
  releaseChannel: string;
  supabasePublishableKey: string;
  supabaseUrl: string;
};
