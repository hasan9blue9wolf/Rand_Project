import type { PressableProps } from "react-native";

import { PrimaryButton } from "./primary-button";
import { SecondaryButton } from "./secondary-button";

type AppButtonProps = PressableProps & {
  busy?: boolean;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
};

export const AppButton = ({
  busy = false,
  label,
  variant = "primary",
  ...rest
}: AppButtonProps) =>
  variant === "primary" ? (
    <PrimaryButton label={label} loading={busy} {...rest} />
  ) : (
    <SecondaryButton
      label={label}
      loading={busy}
      tone={variant === "ghost" ? "navy" : "primary"}
      {...rest}
    />
  );
