import emojiData from "emojibase-data/en/data.json";
import { EmojiEntry } from "./types";
import { normalizeSearchText } from "./emoji-utils";

interface EmojibaseEmojiRecord {
	annotation?: string;
	emoji?: string;
	shortcodes?: string[];
	tags?: string[];
}

function deriveShortcode(
	annotation: string | undefined,
	emoji: string | undefined,
	shortcodes: string[] | undefined,
): string {
	if (shortcodes && shortcodes.length > 0) {
		return shortcodes[0] ?? "";
	}

	if (annotation) {
		return normalizeSearchText(annotation).replace(/ /g, "_");
	}

	return emoji ? normalizeSearchText(emoji) : "";
}

const rawEmojiData = emojiData as EmojibaseEmojiRecord[];

export const DEFAULT_EMOJI_ENTRIES: EmojiEntry[] = rawEmojiData.reduce<
	EmojiEntry[]
>((entries, entry) => {
	const shortcode = deriveShortcode(
		entry.annotation,
		entry.emoji,
		entry.shortcodes,
	);
	if (!shortcode || !entry.emoji) {
		return entries;
	}

	const aliases = entry.shortcodes ? entry.shortcodes.slice(1) : [];
	const keywords = [
		entry.annotation,
		...(entry.tags ?? []),
		...aliases,
	].filter((value): value is string => Boolean(value));

	entries.push({
		shortcode,
		aliases,
		label: entry.annotation ?? shortcode,
		keywords,
		emoji: entry.emoji,
		source: "builtin" as const,
	});

	return entries;
}, []);
