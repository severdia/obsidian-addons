import { App } from "obsidian";
import { useContext } from "react";
import { AppContext } from "utils";

export const useLocalApp = (): App | undefined => {
  return useContext(AppContext);
};
