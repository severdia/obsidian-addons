import { App } from "obsidian";
import { useStore } from "store";

export const useApp = (): App => {
  return useStore((state) => state.app)!;
};
