import type { TripStatus } from "../../types/travel";
import { Chip } from "./chip";

type StatusBadgeProps = {
  label: string;
  status: TripStatus;
};

const tones: Record<TripStatus, "success" | "warning" | "primary"> = {
  confirmed: "success",
  planning: "warning",
  wishlist: "primary",
};

export const StatusBadge = ({ label, status }: StatusBadgeProps) => (
  <Chip label={label} tone={tones[status]} />
);
