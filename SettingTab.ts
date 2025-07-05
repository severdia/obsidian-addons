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
      .setName("Donate")
      .setDesc(
        "If you like this Plugin, consider donating to support continued development:"
      )
      .addButton((bt) => {
        bt.buttonEl.outerHTML = `
        <a href="https://www.buymeacoffee.com/severdia" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-red.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
        <script 
          type="text/javascript" 
          src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js" 
          data-name="bmc-button" 
          data-slug="severdia" 
          data-color="#FF5F5F" 
          data-emoji=""  
          data-font="Cookie" 
          data-text="Buy me a coffee" 
          data-outline-color="#000000" 
          data-font-color="#ffffff" 
          data-coffee-color="#FFDD00">
        </script>
        `;
      });

    new Setting(containerEl)
      .setName("Disable dragging folders and files")
      .addToggle((toggleComp) => {
        toggleComp.setValue(
          this.plugin.settings.isDraggingFilesAndFoldersdisabled
        );
        toggleComp.onChange(async (value: boolean) => {
          this.plugin.settings.isDraggingFilesAndFoldersdisabled = value;
          await this.updateSettings();
        });
      });

    new Setting(containerEl)
      .setName("Hide attachment folders")
      .setDesc(
        "This setting hides all folders with the name you set in the Files & Links setting."
      )
      .addToggle((toggleComp) => {
        toggleComp.setValue(this.plugin.settings.hideAttachmentFolder);
        toggleComp.onChange(async (value: boolean) => {
          this.plugin.settings.hideAttachmentFolder = value;
          await this.updateSettings();
        });
      });

    new Setting(containerEl)
      .setName("Hide vault name")
      .setDesc("This setting hides vault name from the file explorer.")
      .addToggle((toggleComp) => {
        toggleComp.setValue(this.plugin.settings.hideVaultFolder);
        toggleComp.onChange(async (value: boolean) => {
          this.plugin.settings.hideVaultFolder = value;
          await this.updateSettings();
        });
      });

    new Setting(containerEl)
      .setName("Sort By")
      .addDropdown((dropDownComponent) => {
        dropDownComponent
          .addOption("default", "Default (Title)")
          .addOption("date-edited", "Date Edited")
          .addOption("date-created", "Date Created")
          .addOption("title", "Title")
          .setValue(this.plugin.settings.sortBy)
          .onChange(
            async (
              value: "default" | "date-edited" | "date-created" | "title"
            ) => {
              this.plugin.settings.sortBy = value;
              await this.updateSettings();
            }
          );
      });

    new Setting(containerEl)
      .setName("Sorting Order")
      .addDropdown((dropDownComponent) => {
        dropDownComponent
          .addOption("ascending", "Ascending")
          .addOption("descending", "Descending")
          .setValue(this.plugin.settings.sortOrder)
          .onChange(async (value: "ascending" | "descending") => {
            this.plugin.settings.sortOrder = value;
            await this.updateSettings();
          });
      });
  }

  updateSettings = async () => {
    await this.plugin.saveSettings();
    useStore.getState().setForceFilesystemUpdate();
    useStore.getState().setForceNotesViewUpdate();
  };
}
