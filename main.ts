import { Plugin, WorkspaceLeaf, WorkspaceWindow } from "obsidian";
import { PluginView, VIEW_TYPE } from "./src/PluginView";
import { useStore } from "store";
import { SettingTab } from "./SettingTab";

interface NotesBrowserSettings {
  isDraggingFilesAndFoldersdisabled: boolean;
  hideAttachmentFolder: boolean;
  hideVaultFolder: boolean;
  sortBy: "default" | "date-edited" | "date-created" | "title";
  sortOrder: "ascending" | "descending";
  openOnStartup: boolean;
}

const DEFAULT_SETTINGS: NotesBrowserSettings = {
  isDraggingFilesAndFoldersdisabled: false,
  hideAttachmentFolder: false,
  hideVaultFolder: false,
  sortBy: "default",
  sortOrder: "ascending",
  openOnStartup: true,
};

export default class NotesBrowser extends Plugin {
  settings: NotesBrowserSettings;

  async onload() {
    await this.loadSettings();
    useStore.getState().app = this.app;

    this.addSettingTab(new SettingTab(this.app, this));
    this.registerView(VIEW_TYPE, (leaf) => new PluginView(leaf, this));

    this.addRibbonIcon("folder", "Apple Notes", () => {
      this.activateView();
    });

    this.app.workspace.onLayoutReady(async () => {
      if (this.settings.openOnStartup) {
        this.activateView();
      }
    });

    this.app.workspace.on("active-leaf-change", this.onActiveLeafChange);
    this.app.vault.on("create", this.onCreate);
    this.app.vault.on("delete", this.onDelete);
    this.app.vault.on("rename", this.onRename);
    this.app.vault.on("modify", this.onModify);
  }

  onunload() {
    this.app.workspace.off("active-leaf-change", this.onActiveLeafChange);
    this.app.vault.off("create", this.onCreate);
    this.app.vault.off("delete", this.onDelete);
    this.app.vault.off("rename", this.onRename);
    this.app.vault.off("modify", this.onModify);
  }

  updateNotesView = () => {
    const {
      setForceFilesystemUpdate,
      setCurrentActiveFolderPath,
      currentActiveFolderPath,
    } = useStore.getState();
    setForceFilesystemUpdate();
    setCurrentActiveFolderPath(currentActiveFolderPath);
  };

  onDelete = () => {
    this.updateNotesView();
  };

  onCreate = () => {
    this.updateNotesView();
  };

  onRename = () => {
    this.updateNotesView();
  };

  onModify = () => {
    useStore.getState().setForceNotesViewUpdate();
  };

  onActiveLeafChange = (leaf: WorkspaceLeaf | null) => {
    if (leaf && leaf.getContainer() instanceof WorkspaceWindow) {
      return;
    }
    if (
      leaf?.getViewState().type !== "markdown" &&
      leaf?.getViewState().type !== "canvas" &&
      leaf?.getViewState().type !== "base" &&
      leaf?.getViewState().type !== "image"
    )
      return;

    const currentOpenFile = this.app.workspace.getActiveFile();
    if (!currentOpenFile?.parent) return;

    if (leaf?.getViewState().type === "image") {
      useStore.getState().setCurrentActiveFilePath(currentOpenFile.path);
      return
    }
    useStore.getState().setCurrentActiveFilePath(currentOpenFile.path);
    useStore.getState().setCurrentActiveFolderPath(currentOpenFile.parent.path);
  };

  async loadSettings() {
    this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async activateView() {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getLeftLeaf(false);
      await leaf?.setViewState({ type: VIEW_TYPE, active: true });
    }

    leaf && workspace.revealLeaf(leaf);
  }
}
