import { DEFAULT_EMOJI_ENTRIES } from "./default-emojis";
import { EmojiEntry, EmotePluginSettings } from "./types";
import {
	loadPackManifest,
	loadRegistry,
	packManifestToEntries,
} from "./pack-registry";
import { normalizeSearchText, similarityScore } from "./emoji-utils";

function uniqueEntries(entries: EmojiEntry[]): EmojiEntry[] {
	const seen = new Set<string>();
	const result: EmojiEntry[] = [];

	for (const entry of entries) {
		const key = `${entry.source}:${entry.packId ?? "builtin"}:${entry.shortcode}`;
		if (seen.has(key)) {
			continue;
		}

		seen.add(key);
		result.push(entry);
	}

	return result;
}

export class EmojiCatalog {
	private readonly builtInEntries: EmojiEntry[];
	private entries: EmojiEntry[];
	private shortcodeIndex = new Map<string, EmojiEntry>();

	constructor(entries: EmojiEntry[] = DEFAULT_EMOJI_ENTRIES) {
		this.builtInEntries = entries;
		this.entries = entries;
		this.rebuildIndex();
	}

	getAllEntries(): EmojiEntry[] {
		return this.entries;
	}

	resolve(shortcode: string): EmojiEntry | null {
		const normalized = normalizeSearchText(shortcode)
			.replace(/^:+|:+$/g, "")
			.replace(/ /g, "_");
		return this.shortcodeIndex.get(normalized) ?? null;
	}

	search(query: string, limit: number): EmojiEntry[] {
		const normalizedQuery = normalizeSearchText(query);
		if (!normalizedQuery) {
			return [];
		}

		return this.entries
			.map((entry) => ({
				entry,
				score: this.scoreEntry(normalizedQuery, entry),
			}))
			.filter((candidate) => Number.isFinite(candidate.score))
			.sort(
				(left, right) =>
					left.score - right.score ||
					left.entry.label.localeCompare(right.entry.label),
			)
			.slice(0, limit)
			.map((candidate) => candidate.entry);
	}

	async refreshRemotePacks(
		settings: EmotePluginSettings,
		force = false,
	): Promise<void> {
		if (
			(!force && !settings.loadRemotePacksOnStartup) ||
			!settings.registryUrl
		) {
			this.entries = this.builtInEntries;
			this.rebuildIndex();
			return;
		}

		const registry = await loadRegistry(settings.registryUrl);
		if (!registry) {
			this.entries = this.builtInEntries;
			this.rebuildIndex();
			return;
		}

		const enabledPackIds = new Set(settings.enabledPackIds);
		const packEntries: EmojiEntry[] = [];

		for (const packSummary of registry.packs) {
			if (
				enabledPackIds.size > 0 &&
				!enabledPackIds.has(packSummary.id)
			) {
				continue;
			}

			const manifest = await loadPackManifest(packSummary.manifestUrl);
			if (!manifest) {
				continue;
			}

			packEntries.push(...packManifestToEntries(manifest));
		}

		this.entries = uniqueEntries([...this.builtInEntries, ...packEntries]);
		this.rebuildIndex();
	}

	private scoreEntry(query: string, entry: EmojiEntry): number {
		const candidates = [
			entry.shortcode,
			...entry.aliases,
			entry.label,
			...(entry.keywords ?? []),
			entry.emoji ?? "",
		];

		let bestScore = Number.POSITIVE_INFINITY;
		for (const candidate of candidates) {
			const score = similarityScore(query, candidate);
			if (score < bestScore) {
				bestScore = score;
			}
		}

		return bestScore;
	}

	private rebuildIndex(): void {
		this.shortcodeIndex = new Map<string, EmojiEntry>();

		for (const entry of this.entries) {
			this.shortcodeIndex.set(
				normalizeSearchText(entry.shortcode).replace(/ /g, "_"),
				entry,
			);
			for (const alias of entry.aliases) {
				this.shortcodeIndex.set(
					normalizeSearchText(alias).replace(/ /g, "_"),
					entry,
				);
			}
		}
	}
}
