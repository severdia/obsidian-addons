import { App, TFile, TFolder } from "obsidian";
import { sortFoldersAlphabetically, toBoolean } from "utils";
import { create } from "zustand";

type NotesViewType = "LIST" | "GRID";

interface State {
  notes: TFile[];
  app?: App;
  currentNoteIndex: number | null;
  currentSelectedNoteIndex: number | null;
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
  setCurrentNoteIndex: (position: number) => void;
  setCurrentSelectedNoteIndex: (position: number) => void;
  flatTree: string[];
  folderIndicesTracker: Map<string, string>;
  setFlatTree: (root: TFolder) => void;
}

export const useStore = create<State>()((set) => ({
  notes: [],
  forceFilesyetemUpdate: 0,
  currentSelectedNoteIndex: null,
  notesViewType: "LIST",
  forceNotesViewUpdate: 0,
  isFolderFocused: true,
  currentNoteIndex: null,
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
      if (!path || !state.app) return state;

      if (options?.isTrashFolder)
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
  setCurrentNoteIndex: (position) => {
    set((state) => {
      return { ...state, currentNoteIndex: position };
    });
  },
  setCurrentSelectedNoteIndex: (position) => {
    set((state) => {
      return { ...state, currentSelectedNoteIndex: position };
    });
  },

  flatTree: [],
  folderIndicesTracker: new Map(),
  setFlatTree: (root: TFolder) => {
    set((state) => {
      const flatTree: string[] = [];
      const folderIndicesTracker = new Map<string, string>();
      const traverse = (node: TFolder) => {
        const isExpanded = toBoolean(localStorage.getItem(node.path));
        const index = flatTree.length;
        folderIndicesTracker.set(node.path, `${index}`);
        folderIndicesTracker.set(`${index}`, node.path);
        flatTree.push(node.path);
        state.flatTree;
        if (isExpanded && node.children && node.children.length > 0) {
          sortFoldersAlphabetically(
            node.children.filter((node) => node instanceof TFolder)
          ).forEach(traverse);
        }
      };

      traverse(root);

      return { ...state, flatTree, folderIndicesTracker };
    });
  },
}));
