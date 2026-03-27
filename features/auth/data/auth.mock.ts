import type { AuthScreenData, AuthSession } from "../types";

export const authSessionMock: AuthSession = {
  displayName: "Maya",
  email: "maya@travelgenious.app",
  firstName: "Maya",
  userId: "user-maya-01",
};

export const authScreenMock: AuthScreenData = {
  fields: [
    {
      id: "firstName",
      label: "First name",
      placeholder: "How should Heia greet you?",
    },
    {
      id: "email",
      label: "Email",
      placeholder: "you@example.com",
    },
    {
      id: "password",
      label: "Password",
      placeholder: "Enter your password",
      secureTextEntry: true,
    },
  ],
  mode: "signIn",
  primaryActionLabel: "Continue",
  providers: ["email", "google", "apple"],
  secondaryActionLabel: "Create account",
  subtitle: "Bootstrap session state, providers, and entry flows from one module.",
  title: "Authentication",
};
