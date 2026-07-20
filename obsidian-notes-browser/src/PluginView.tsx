import { ItemView, TFile, WorkspaceLeaf } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { PluginUI } from "components/PluginView";
import { ObsidianConfigContext, PluginContext } from "utils";
import NotesBrowser from "main";
import { useStore } from "store";

export const VIEW_TYPE = "obsidian-notes-browser";

export class PluginView extends ItemView {
  root: Root | null = null;
  plugin: NotesBrowser;

  constructor(leaf: WorkspaceLeaf, plugin: NotesBrowser) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return "Apple Notes Explorer";
  }

  getIcon() {
    return "folder";
  }

  async onOpen() {
    this.containerEl.setAttribute("id", "obsidian-note-browser");
    this.root = createRoot(this.containerEl.children[1]);
    const obsidianConfig = await this.plugin.app.vault.adapter.read(
      `${this.plugin.app.vault.configDir}/app.json`
    );

    const workspaceRawData = await this.plugin.app.vault.adapter.read(
      `${this.plugin.app.vault.configDir}/workspace.json`
    );

    const workspaceParsedData = JSON.parse(workspaceRawData);

    const latestActiveFile = workspaceParsedData.lastOpenFiles[0];
    const latestActiveFolder =
      this.app.vault.getFileByPath(latestActiveFile)?.parent;

    if (latestActiveFolder) {
      useStore.getState().setCurrentActiveFilePath(latestActiveFile);
      useStore.getState().setCurrentActiveFolderPath(latestActiveFolder.path);
    }

    this.root.render(
      <ObsidianConfigContext.Provider value={JSON.parse(obsidianConfig)}>
        <PluginContext.Provider value={this.plugin}>
          <PluginUI />
        </PluginContext.Provider>
      </ObsidianConfigContext.Provider>
    );
  }

  async onClose() {
    this.root?.unmount();
  }
}
