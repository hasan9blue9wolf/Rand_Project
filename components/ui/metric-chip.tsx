import { Ionicons } from "@expo/vector-icons";

import { Chip } from "./chip";

type MetricChipProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

export const MetricChip = ({ icon, label }: MetricChipProps) => (
  <Chip icon={icon as keyof typeof Ionicons.glyphMap} label={label} tone="primary" />
);
