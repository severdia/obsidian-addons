import { App, Plugin, PluginSettingTab, Setting, Platform } from "obsidian";

interface DeviceThemeSettings {
	/** Theme folder name to load on desktop. Empty string = Obsidian default (inject nothing). */
	desktopTheme: string;
	/** Theme folder name to load on phone/tablet. Empty string = Obsidian default (inject nothing). */
	mobileTheme: string;
}

const DEFAULT_SETTINGS: DeviceThemeSettings = {
	desktopTheme: "",
	mobileTheme: "",
};

const STYLE_EL_ID = "device-theme-injected";

export default class DeviceThemePlugin extends Plugin {
	settings: DeviceThemeSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new DeviceThemeSettingTab(this.app, this));
		// Apply immediately (not on layout-ready) to minimize the flash of the
		// default theme before the device theme is injected. Platform flags are
		// available this early; they don't depend on the workspace being ready.
		await this.applyTheme();
	}

	onunload() {
		this.removeInjectedTheme();
	}

	/** Which theme should this specific device load, based on its platform. */
	currentTargetTheme(): string {
		// Platform.isMobile is true on phones AND tablets (including iPad).
		return Platform.isMobile ? this.settings.mobileTheme : this.settings.desktopTheme;
	}

	/** Remove any previously injected theme, then inject the current device's theme (if any). */
	async applyTheme() {
		this.removeInjectedTheme();

		const themeName = this.currentTargetTheme();
		if (!themeName) return; // Default: inject nothing, let Obsidian's default appearance stand.

		const cssPath = `${this.app.vault.configDir}/themes/${themeName}/theme.css`;

		let css: string;
		try {
			if (!(await this.app.vault.adapter.exists(cssPath))) {
				console.warn(`[Device Theme] theme.css not found for "${themeName}" at ${cssPath}`);
				return;
			}
			css = await this.app.vault.adapter.read(cssPath);
		} catch (e) {
			console.error("[Device Theme] failed to read theme CSS", e);
			return;
		}

		const style = document.createElement("style");
		style.id = STYLE_EL_ID;
		style.setAttribute("data-device-theme", themeName);
		style.textContent = css;
		document.head.appendChild(style);
	}

	removeInjectedTheme() {
		document.getElementById(STYLE_EL_ID)?.remove();
	}

	/** List installed theme folder names by reading the vault's config dir. */
	async listInstalledThemes(): Promise<string[]> {
		const themesDir = `${this.app.vault.configDir}/themes`;
		try {
			if (!(await this.app.vault.adapter.exists(themesDir))) return [];
			const listing = await this.app.vault.adapter.list(themesDir);
			return listing.folders
				.map((f) => f.split("/").pop() as string)
				.filter((n) => n.length > 0)
				.sort((a, b) => a.localeCompare(b));
		} catch (e) {
			console.error("[Device Theme] failed to list themes", e);
			return [];
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class DeviceThemeSettingTab extends PluginSettingTab {
	plugin: DeviceThemePlugin;

	constructor(app: App, plugin: DeviceThemePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async display() {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("p", {
			text:
				"Set your active theme to Default in Appearance on every device. This plugin " +
				"then injects the chosen theme per platform. Because it never writes to " +
				"appearance.json, your devices won't fight over a synced theme setting.",
			cls: "setting-item-description",
		});

		const themes = await this.plugin.listInstalledThemes();
		const options: Record<string, string> = { "": "Default (Obsidian)" };
		for (const t of themes) options[t] = t;

		new Setting(containerEl)
			.setName("Desktop theme")
			.setDesc("Loaded on Mac / Windows / Linux.")
			.addDropdown((dd) =>
				dd
					.addOptions(options)
					.setValue(this.plugin.settings.desktopTheme)
					.onChange(async (value) => {
						this.plugin.settings.desktopTheme = value;
						await this.plugin.saveSettings();
						if (Platform.isDesktop) await this.plugin.applyTheme();
					})
			);

		new Setting(containerEl)
			.setName("Mobile theme")
			.setDesc("Loaded on phone / tablet, including iPad. Usually leave as Default.")
			.addDropdown((dd) =>
				dd
					.addOptions(options)
					.setValue(this.plugin.settings.mobileTheme)
					.onChange(async (value) => {
						this.plugin.settings.mobileTheme = value;
						await this.plugin.saveSettings();
						if (Platform.isMobile) await this.plugin.applyTheme();
					})
			);

		new Setting(containerEl)
			.setName("Reapply now")
			.setDesc("Force a re-inject for this device (useful after editing a theme's CSS).")
			.addButton((b) =>
				b.setButtonText("Reapply").onClick(() => this.plugin.applyTheme())
			);
	}
}
