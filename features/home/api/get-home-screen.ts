import { simulateRequest } from "../../../services/api/client";
import { homeScreenMock } from "../data/home.mock";

export const getHomeScreen = () => simulateRequest(homeScreenMock, 320);
