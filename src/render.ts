import { EmojiCatalog } from "./emoji-catalog";
import { EmojiEntry, EmotePluginSettings } from "./types";
import { shortcodeText } from "./emoji-utils";

const SHORTCODE_PATTERN = /:([a-z0-9_+\-]{1,}):/gi;
const SKIPPED_TAGS = new Set(["CODE", "PRE", "SCRIPT", "STYLE", "TEXTAREA"]);

function textContainsShortcode(text: string): boolean {
	const matcher = new RegExp(
		SHORTCODE_PATTERN.source,
		SHORTCODE_PATTERN.flags,
	);
	return matcher.test(text);
}

function createEmojiNode(document: Document, entry: EmojiEntry): HTMLElement {
	if (entry.asset) {
		const image = document.createElement("img");
		image.className = "emotes-rendered-emote emotes-rendered-image";
		image.src = entry.asset.path;
		image.alt = entry.label;
		image.title = `${shortcodeText(entry.shortcode)} ${entry.label}`;
		image.loading = "lazy";
		if (entry.asset.animated) {
			image.dataset.animated = "true";
		}
		return image;
	}

	const span = document.createElement("span");
	span.className = "emotes-rendered-emote";
	span.textContent = entry.emoji ?? shortcodeText(entry.shortcode);
	span.title = `${shortcodeText(entry.shortcode)} ${entry.label}`;
	return span;
}

function replaceTextNode(
	node: Text,
	resolveEntry: (shortcode: string) => EmojiEntry | null,
): void {
	const text = node.nodeValue;
	if (!text) {
		return;
	}

	SHORTCODE_PATTERN.lastIndex = 0;
	if (!textContainsShortcode(text)) {
		return;
	}

	const document = node.ownerDocument;
	if (!document) {
		return;
	}

	SHORTCODE_PATTERN.lastIndex = 0;
	const fragment = document.createDocumentFragment();
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = SHORTCODE_PATTERN.exec(text)) !== null) {
		const before = text.slice(lastIndex, match.index);
		if (before) {
			fragment.append(before);
		}

		const entry = resolveEntry(match[1] ?? "");
		if (entry) {
			fragment.append(createEmojiNode(document, entry));
		} else {
			fragment.append(match[0]);
		}

		lastIndex = match.index + match[0].length;
	}

	const after = text.slice(lastIndex);
	if (after) {
		fragment.append(after);
	}

	node.replaceWith(fragment);
}

export function registerEmojiRenderer(
	root: HTMLElement,
	_catalog: EmojiCatalog,
	settings: EmotePluginSettings,
	resolveEntry: (shortcode: string) => EmojiEntry | null,
): void {
	if (!settings.renderShortcodes) {
		return;
	}

	const walker =
		root.ownerDocument?.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
			acceptNode(node) {
				const parent = node.parentElement;
				if (!parent || SKIPPED_TAGS.has(parent.tagName)) {
					return NodeFilter.FILTER_REJECT;
				}

				return node.nodeValue && textContainsShortcode(node.nodeValue)
					? NodeFilter.FILTER_ACCEPT
					: NodeFilter.FILTER_REJECT;
			},
		}) ?? null;

	if (!walker) {
		return;
	}

	const textNodes: Text[] = [];
	while (walker.nextNode()) {
		textNodes.push(walker.currentNode as Text);
	}

	for (const textNode of textNodes) {
		replaceTextNode(textNode, resolveEntry);
	}
}
