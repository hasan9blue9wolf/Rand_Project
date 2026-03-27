import { simulateRequest } from "../../../services/api/client";
import { packagesScreenMock } from "../data/packages.mock";

export const getPackagesScreenData = () => simulateRequest(packagesScreenMock, 280);
