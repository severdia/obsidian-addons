import { createContext } from "react";
import NotesBrowser from "main";

export const PluginContext = createContext<NotesBrowser | undefined>(undefined);