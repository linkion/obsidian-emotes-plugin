export type EmojiSource = "builtin" | "pack";

export interface EmojiAsset {
	path: string;
	mimeType?: string;
	animated?: boolean;
}

export interface EmojiEntry {
	shortcode: string;
	aliases: string[];
	label: string;
	keywords: string[];
	emoji?: string;
	source: EmojiSource;
	packId?: string;
	asset?: EmojiAsset;
}

export interface EmojiPackEmojiDefinition {
	shortcode: string;
	label: string;
	aliases?: string[];
	keywords?: string[];
	emoji?: string;
	asset: EmojiAsset;
}

export interface EmojiPackManifest {
	schemaVersion: 1;
	id: string;
	name: string;
	version: string;
	description?: string;
	author?: string;
	homepageUrl?: string;
	manifestUrl?: string;
	emojis: EmojiPackEmojiDefinition[];
}

export interface EmojiRegistryPackSummary {
	id: string;
	name: string;
	version: string;
	description?: string;
	author?: string;
	manifestUrl: string;
	homepageUrl?: string;
}

export interface EmojiRegistryManifest {
	schemaVersion: 1;
	updatedAt?: string;
	packs: EmojiRegistryPackSummary[];
}

export interface EmotePluginSettings {
	enableAutocomplete: boolean;
	renderShortcodes: boolean;
	suggestionLimit: number;
	registryUrl: string;
	enabledPackIds: string[];
	loadRemotePacksOnStartup: boolean;
}
