import { normalizeHayaApiUrl } from "../haya-api-config";

describe("Haya API configuration", () => {
  it("normalizes safe URLs", () => expect(normalizeHayaApiUrl("https://api.example.com///")).toBe("https://api.example.com"));
  it("allows Android emulator localhost", () => expect(normalizeHayaApiUrl("http://10.0.2.2:8787/")).toBe("http://10.0.2.2:8787"));
  it("rejects secrets and unsafe remote HTTP", () => {
    expect(normalizeHayaApiUrl("sk-secret")).toBe("");
    expect(normalizeHayaApiUrl("http://api.example.com")).toBe("");
  });
});
