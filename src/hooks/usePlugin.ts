import { useContext } from "react";
import { PluginContext } from "utils";
import NotesBrowser from "main";

export const usePlugin = (): NotesBrowser => {
  return useContext(PluginContext) as NotesBrowser;
};
