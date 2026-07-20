import { useStore } from "store";
import NotesBrowser from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class SettingTab extends PluginSettingTab {
  plugin: NotesBrowser;

  constructor(app: App, plugin: NotesBrowser) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Disable dragging folders and files")
      .addToggle((toggleComp) => {
        toggleComp.setValue(
          this.plugin.settings.isDraggingFilesAndFoldersdisabled
        );
        toggleComp.onChange(async (value: boolean) => {
          this.plugin.settings.isDraggingFilesAndFoldersdisabled = value;
          this.updateSettings();
        });
      });

    new Setting(containerEl)
      .setName("Hide attachment folders")
      .setDesc("This setting hides all folders with the name you set in the Files & Links setting.")
      .addToggle((toggleComp) => {
        toggleComp.setValue(this.plugin.settings.hideAttachmentFolder);
        toggleComp.onChange(async (value: boolean) => {
          this.plugin.settings.hideAttachmentFolder = value;
          this.updateSettings();
        });
      });
  }

  updateSettings = async () => {
    await this.plugin.saveSettings();
    useStore.getState().setForceFilesystemUpdate();
    useStore.getState().setForceNotesViewUpdate();
  };
}
