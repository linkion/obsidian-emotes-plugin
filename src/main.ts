import { Notice, Plugin } from "obsidian";
import { DEFAULT_EMOTE_SETTINGS, EmotePluginSettingTab } from "./settings";
import { DEFAULT_EMOJI_ENTRIES } from "./default-emojis";
import { EmojiCatalog } from "./emoji-catalog";
import { EmojiSuggest } from "./emoji-suggest";
import { registerEmojiRenderer } from "./render";
import { EmotePluginSettings } from "./types";

export default class EmotePlugin extends Plugin {
	settings: EmotePluginSettings;
	private catalog = new EmojiCatalog(DEFAULT_EMOJI_ENTRIES);

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new EmotePluginSettingTab(this.app, this));
		this.addCommand({
			id: "refresh-emoji-packs",
			name: "Refresh emoji packs",
			callback: async () => {
				await this.refreshPacks();
				new Notice("Emoji packs refreshed.");
			},
		});

		this.registerEditorSuggest(
			new EmojiSuggest(this.app, this.catalog, () => this.settings),
		);
		this.registerMarkdownPostProcessor((element) => {
			registerEmojiRenderer(
				element,
				this.catalog,
				this.settings,
				(shortcode) => this.catalog.resolve(shortcode),
			);
		});

		void this.refreshPacks();
	}

	onunload() {}

	async refreshPacks(): Promise<void> {
		try {
			await this.catalog.refreshRemotePacks(this.settings, true);
		} catch (error) {
			console.error("Failed to refresh emoji packs", error);
		}
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_EMOTE_SETTINGS,
			(await this.loadData()) as Partial<EmotePluginSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
