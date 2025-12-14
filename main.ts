import {
  FileSystemAdapter,
  Plugin,
  TFile,
  WorkspaceLeaf,
  WorkspaceWindow,
} from "obsidian";
import { PluginView, VIEW_TYPE } from "./src/PluginView";
import { useStore } from "store";
import { SettingTab } from "./SettingTab";
import { shell } from "electron";
import * as path from "path";
import { pathToFileURL } from "url";
import { openInDefaultIndicatorStyle } from "./src/constants";
import { Platform } from "obsidian";

interface NotesBrowserSettings {
  isDraggingFilesAndFoldersdisabled: boolean;
  hideAttachmentFolder: boolean;
  hideVaultFolder: boolean;
  sortBy: "default" | "date-edited" | "date-created" | "title";
  sortOrder: "ascending" | "descending";
  openOnStartup: boolean;
  openInDefaultAppButton: boolean;
}

const DEFAULT_SETTINGS: NotesBrowserSettings = {
  isDraggingFilesAndFoldersdisabled: false,
  hideAttachmentFolder: false,
  hideVaultFolder: false,
  sortBy: "default",
  sortOrder: "ascending",
  openOnStartup: true,
  openInDefaultAppButton: true,
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

    this.registerImageDblClick();
    if (this.settings.openInDefaultAppButton) {
      this.addGlobalStyle();
    } else {
      this.removeGlobalStyle();
    }
  }

  addGlobalStyle(id = "custom-embed-style") {
    if (document.getElementById(id)) return; // prevent duplicates

    const style = document.createElement("style");
    style.id = id;
    style.textContent = openInDefaultIndicatorStyle;
    document.head.appendChild(style);
  }

  removeGlobalStyle(id = "custom-embed-style") {
    const style = document.getElementById(id);
    if (style) {
      style.remove();
    }
  }

  registerImageDblClick(): void {
    // Add support for both desktop right-click and mobile long-press
    this.registerDomEvent(
      document,
      "click",
      async (ev) => {
        if (!this.settings.openInDefaultAppButton) return;
        const img = this.findMediaElement(ev);
        if (!img) return;
        ev.preventDefault();
        const activeEditor = this.app.workspace.activeEditor?.file;
        if (!(activeEditor instanceof TFile)) return;
        const srcAttr = img.getAttribute("src");

        if (!srcAttr) {
          console.warn("No src attribute found on image.");
          return;
        }

        const decodedSrc = decodeURIComponent(srcAttr);
        const activeFilePath = activeEditor?.path;

        const linkDest = this.app.metadataCache.getFirstLinkpathDest(
          decodedSrc,
          activeFilePath
        );

        if (!linkDest) {
          console.warn("Unable to resolve link destination for image.");
          return;
        }

        const adapter = this.app.vault.adapter;
        if (!(adapter instanceof FileSystemAdapter)) {
          console.warn(
            "Vault adapter is not a FileSystemAdapter. Cannot resolve file path."
          );
          return;
        }

        const vaultBasePath = adapter.getBasePath();
        const imageFilePath = path.join(vaultBasePath, linkDest.path);
        const fileUrl = pathToFileURL(imageFilePath).toString();
        console.log(fileUrl);
        shell.openExternal(fileUrl);
      },
      true
    );
  }

  findMediaElement(event: MouseEvent): HTMLElement | null {
    const target = event.target;
    if (!target || !(target instanceof HTMLElement)) return null;

    const embed = target.closest(".internal-embed") as HTMLElement;
    if (!embed) return null;

    const hasMedia =
      embed.querySelector("img, audio, video") !== null ||
      embed.classList.contains("pdf-embed");
    if (!hasMedia) return null;

    // Get computed styles for ::after
    const styles = window.getComputedStyle(embed, "::after");
    const content = styles.getPropertyValue("content");

    if (!content || content === "none") return null;

    const rect = embed.getBoundingClientRect();
    const afterHeight = parseFloat(styles.getPropertyValue("height")) || 0;
    const marginTop = parseFloat(styles.getPropertyValue("margin-top")) || 0;
    const paddingTop = parseFloat(styles.getPropertyValue("padding-top")) || 0;
    const paddingBottom =
      parseFloat(styles.getPropertyValue("padding-bottom")) || 0;
    const totalAfterHeight =
      afterHeight + marginTop + paddingTop + paddingBottom;

    const clickY = event.clientY;
    const afterTop = rect.bottom - totalAfterHeight;
    const afterBottom = rect.bottom;

    const clickX = event.clientX;
    const LINK_ICON_SIZE = 30;
    const afterLeft = rect.left + rect.width - LINK_ICON_SIZE; // here we handle the left space before the link
    const afterRight = rect.right;

    const isInAfter =
      clickY >= afterTop &&
      clickY <= afterBottom &&
      clickX >= afterLeft &&
      clickX <= afterRight;

    return isInAfter ? embed : null;
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
    if (!leaf) return;

    if (leaf.getContainer() instanceof WorkspaceWindow) {
      return;
    }

    const currentOpenFile = this.app.workspace.getActiveFile();
    const viewType = leaf.getViewState().type;

    const fileBasedViewTypes = new Set([
      "markdown",
      "canvas",
      "bases",
      "image",
      "pdf",
      "audio",
      "video",
    ]);

    if (!fileBasedViewTypes.has(viewType) || !currentOpenFile) {
      return;
    }

    useStore.getState().setCurrentActiveFilePath(currentOpenFile.path);
    useStore
      .getState()
      .setCurrentActiveFolderPath(currentOpenFile.parent?.path || "/");
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
