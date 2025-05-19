import { useContext } from "react";
import { ObsidianConfigContext } from "utils";

export const useObsidianConfig = (): { [key: string]: unknown } => {
  return useContext(ObsidianConfigContext);
};
