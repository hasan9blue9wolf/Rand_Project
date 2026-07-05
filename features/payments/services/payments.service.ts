import { simulateRequest } from "../../../services/api/client";
import { paymentsScreenMock } from "../data/payments.mock";

export const getPaymentsScreenData = () => simulateRequest(paymentsScreenMock, 240);
