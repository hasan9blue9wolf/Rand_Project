import {
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

import { useAuthStore } from "../../../../store/auth-store";
import { useDemoModeStore } from "../../../../store/demo-mode-store";
import {
  getCurrentAuthSession,
  signInWithEmailPassword,
  signOutCurrentUser,
  signUpWithEmailPassword,
} from "../auth.service";

describe("auth service demo integration", () => {
  it("signs in through the demo path and syncs the active session stores", async () => {
    jest.useFakeTimers();

    const sessionPromise = signInWithEmailPassword({
      email: "investor@travelgenious.demo",
      password: "secret",
    });

    jest.advanceTimersByTime(300);

    const session = await sessionPromise;

    expect(session?.email).toBe("investor@travelgenious.demo");
    expect(useAuthStore.getState().demoSession?.email).toBe(
      "investor@travelgenious.demo",
    );
    expect(useDemoModeStore.getState().authSession?.userId).toContain(
      "investor-travelgenious-demo",
    );
    expect(await getCurrentAuthSession()).toEqual(session);
  });

  it("supports demo sign-up and sign-out without a backend", async () => {
    jest.useFakeTimers();

    const signUpPromise = signUpWithEmailPassword({
      email: "nora@travelgenious.demo",
      firstName: "Nora",
      password: "secret",
    });

    jest.advanceTimersByTime(300);

    const session = await signUpPromise;

    expect(session?.firstName).toBe("Nora");

    const signOutPromise = signOutCurrentUser();

    jest.advanceTimersByTime(200);
    await signOutPromise;

    expect(useAuthStore.getState().demoSession).toBeNull();
    expect(useDemoModeStore.getState().authSession).toBeNull();
  });
});
