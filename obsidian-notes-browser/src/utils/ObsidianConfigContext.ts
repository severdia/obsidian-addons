import { createContext } from "react";

export const ObsidianConfigContext = createContext<{
  [key: string]: unknown;
}>({});
