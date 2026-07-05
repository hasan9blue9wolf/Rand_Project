import type { TextInputProps } from "react-native";

import { SearchField } from "./search-field";

type AppInputProps = TextInputProps & {
  error?: string | undefined;
  label: string;
};

export const AppInput = ({ error, label, ...rest }: AppInputProps) => (
  <SearchField error={error} label={label} {...rest} />
);
