import type { AppMode } from "../../types/env";
import { getPublicRuntimeConfig } from "./public-config";

export const getAppMode = (): AppMode =>
  getPublicRuntimeConfig().appMode;

export const isDemoModeEnabled = () => getAppMode() === "demo";
