import { simulateRequest } from "../../../services/api/client";
import { settingsScreenMock } from "../data/settings.mock";

export const getSettingsScreenData = () => simulateRequest(settingsScreenMock, 160);
