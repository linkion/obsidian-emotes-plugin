import { App, PluginSettingTab, Setting } from "obsidian";
import type EmotePlugin from "./main";
import { EmotePluginSettings } from "./types";

export const DEFAULT_EMOTE_SETTINGS: EmotePluginSettings = {
	enableAutocomplete: true,
	renderShortcodes: true,
	suggestionLimit: 12,
	registryUrl: "",
	enabledPackIds: [],
	loadRemotePacksOnStartup: false,
};

function packIdsToText(packIds: string[]): string {
	return packIds.join(", ");
}

function textToPackIds(value: string): string[] {
	return value
		.split(",")
		.map((part) => part.trim())
		.filter((part) => part.length > 0);
}

export class EmotePluginSettingTab extends PluginSettingTab {
	plugin: EmotePlugin;

	constructor(app: App, plugin: EmotePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h2", { text: "Emote settings" });

		new Setting(containerEl)
			.setName("Enable autocomplete")
			.setDesc(
				"Show emote suggestions while typing a shortcode like :heart:.",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableAutocomplete)
					.onChange(async (value) => {
						this.plugin.settings.enableAutocomplete = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Render shortcodes")
			.setDesc(
				"Replace shortcode text with the matching emoji in reading view.",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.renderShortcodes)
					.onChange(async (value) => {
						this.plugin.settings.renderShortcodes = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Suggestion limit")
			.setDesc("Limit how many emotes appear in the dropdown.")
			.addText((text) =>
				text
					.setValue(String(this.plugin.settings.suggestionLimit))
					.onChange(async (value) => {
						const parsed = Number.parseInt(value, 10);
						if (!Number.isNaN(parsed) && parsed > 0) {
							this.plugin.settings.suggestionLimit = parsed;
							await this.plugin.saveSettings();
						}
					}),
			);

		new Setting(containerEl)
			.setName("Registry URL")
			.setDesc(
				"Point this at a central JSON registry of community packs.",
			)
			.addText((text) =>
				text
					.setPlaceholder(
						"https://raw.githubusercontent.com/.../registry.json",
					)
					.setValue(this.plugin.settings.registryUrl)
					.onChange(async (value) => {
						this.plugin.settings.registryUrl = value.trim();
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Load remote packs on startup")
			.setDesc(
				"Fetch the registry and enabled packs when Obsidian starts.",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.loadRemotePacksOnStartup)
					.onChange(async (value) => {
						this.plugin.settings.loadRemotePacksOnStartup = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Enabled pack IDs")
			.setDesc("Comma-separated pack IDs to load from the registry.")
			.addText((text) =>
				text
					.setPlaceholder("base, anime, reactions")
					.setValue(
						packIdsToText(this.plugin.settings.enabledPackIds),
					)
					.onChange(async (value) => {
						this.plugin.settings.enabledPackIds =
							textToPackIds(value);
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Refresh packs now")
			.setDesc("Reload the registry and any enabled emoji packs.")
			.addButton((button) =>
				button.setButtonText("Refresh").onClick(async () => {
					await this.plugin.refreshPacks();
				}),
			);
	}
}
