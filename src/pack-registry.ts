import { requestUrl } from "obsidian";
import { EmojiEntry, EmojiPackManifest, EmojiRegistryManifest } from "./types";
import { normalizeSearchText } from "./emoji-utils";

function resolveAssetPath(baseUrl: string, assetPath: string): string {
	return new URL(assetPath, baseUrl).toString();
}

async function fetchJson<T>(url: string): Promise<T> {
	const response = await requestUrl({ url, method: "GET" });
	return response.json as T;
}

export async function loadRegistry(
	registryUrl: string,
): Promise<EmojiRegistryManifest | null> {
	if (!registryUrl) {
		return null;
	}

	try {
		const manifest = await fetchJson<EmojiRegistryManifest>(registryUrl);
		if (manifest.schemaVersion !== 1) {
			return null;
		}

		return manifest;
	} catch {
		return null;
	}
}

export async function loadPackManifest(
	manifestUrl: string,
): Promise<EmojiPackManifest | null> {
	try {
		const manifest = await fetchJson<EmojiPackManifest>(manifestUrl);
		if (manifest.schemaVersion !== 1) {
			return null;
		}

		return {
			...manifest,
			manifestUrl,
		};
	} catch {
		return null;
	}
}

export function packManifestToEntries(
	manifest: EmojiPackManifest,
): EmojiEntry[] {
	return manifest.emojis.map((emoji) => ({
		shortcode: normalizeSearchText(emoji.shortcode).replace(/ /g, "_"),
		aliases: (emoji.aliases ?? []).map((alias) =>
			normalizeSearchText(alias).replace(/ /g, "_"),
		),
		label: emoji.label,
		keywords: [
			emoji.label,
			...(emoji.keywords ?? []),
			emoji.shortcode,
			...(emoji.aliases ?? []),
		],
		emoji: emoji.emoji,
		source: "pack",
		packId: manifest.id,
		asset: {
			...emoji.asset,
			path: resolveAssetPath(
				manifest.manifestUrl ?? "",
				emoji.asset.path,
			),
		},
	}));
}
