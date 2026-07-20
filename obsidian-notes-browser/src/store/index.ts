import { App, TFile } from "obsidian";
import { create } from "zustand";

type NotesViewType = "LIST" | "GRID";

interface State {
  notes: TFile[];
  app?: App;
  currentActiveFilePath: string;
  currentActiveFolderPath: string;
  forceFilesyetemUpdate: number;
  forceNotesViewUpdate: number;
  isFolderFocused: boolean;
  setIsFolderFocused: (isFocused: boolean) => void;
  notesViewType: NotesViewType;
  setNotesViewType: (notesViewType: NotesViewType) => void;
  setNotes: (notes: TFile[]) => void;
  setCurrentActiveFilePath: (file: string | null) => void;
  setCurrentActiveFolderPath: (
    folder: string | null,
    options?: { isTrashFolder: boolean }
  ) => void;
  setForceFilesystemUpdate: () => void;
  setForceNotesViewUpdate: () => void;
}

export const useStore = create<State>()((set) => ({
  notes: [],
  forceFilesyetemUpdate: 0,
  notesViewType: "LIST",
  forceNotesViewUpdate: 0,
  isFolderFocused: true,
  setIsFolderFocused: (isFocused) =>
    set((state) => ({ ...state, isFolderFocused: isFocused })),
  setNotesViewType: (notesViewType) =>
    set((state) => ({ ...state, notesViewType: notesViewType })),
  setForceFilesystemUpdate: () =>
    set((state) => ({
      ...state,
      forceFilesyetemUpdate: state.forceFilesyetemUpdate + 1,
    })),
  setForceNotesViewUpdate: () =>
    set((state) => ({
      ...state,
      forceNotesViewUpdate: state.forceNotesViewUpdate + 1,
    })),
  currentActiveFilePath: "",
  currentActiveFolderPath: "",
  setNotes: (newNotes) => set((state) => ({ ...state, notes: newNotes })),
  setCurrentActiveFilePath: (path: string | null) =>
    set((state) => {
      if (!path) return state;
      return { ...state, currentActiveFilePath: path };
    }),
  setCurrentActiveFolderPath: (path: string | null, options) =>
    set((state) => {
      console.log("run setCurrentActiveFolderPath");
      if (!path || !state.app) return state;
      else if (options?.isTrashFolder)
        return { ...state, currentActiveFolderPath: path, notes: [] };

      const filesUnderFolder = state.app.vault.getFolderByPath(path)?.children;
      if (!filesUnderFolder) return { ...state, currentActiveFolderPath: path };

      return {
        ...state,
        currentActiveFolderPath: path,
        notes: filesUnderFolder.filter(
          (abstractFile) => abstractFile instanceof TFile
        ),
      };
    }),
}));
