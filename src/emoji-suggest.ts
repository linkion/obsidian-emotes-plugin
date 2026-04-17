import {
	App,
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
} from "obsidian";
import { EmojiCatalog } from "./emoji-catalog";
import { EmojiEntry, EmotePluginSettings } from "./types";
import { shortcodeText } from "./emoji-utils";

const SHORTCODE_TRIGGER = /:([a-z0-9_+\-]{1,})$/i;

export class EmojiSuggest extends EditorSuggest<EmojiEntry> {
	constructor(
		app: App,
		private readonly catalog: EmojiCatalog,
		private readonly getSettings: () => EmotePluginSettings,
	) {
		super(app);
	}

	onTrigger(
		cursor: EditorPosition,
		editor: Editor,
	): EditorSuggestTriggerInfo | null {
		const lineText = editor.getLine(cursor.line).slice(0, cursor.ch);
		const match = SHORTCODE_TRIGGER.exec(lineText);
		if (!match || !this.getSettings().enableAutocomplete) {
			return null;
		}

		const query = match[1] ?? "";
		if (query.length === 0) {
			return null;
		}

		return {
			start: {
				line: cursor.line,
				ch: cursor.ch - query.length - 1,
			},
			end: cursor,
			query,
		};
	}

	getSuggestions(context: EditorSuggestContext): EmojiEntry[] {
		return this.catalog.search(
			context.query,
			this.getSettings().suggestionLimit,
		);
	}

	renderSuggestion(value: EmojiEntry, el: HTMLElement): void {
		el.addClass("emotes-suggestion");

		const emojiEl = el.createSpan({ cls: "emotes-suggestion-emoji" });
		emojiEl.setText(value.emoji ?? "•");

		const textWrap = el.createDiv({ cls: "emotes-suggestion-text" });
		textWrap.createDiv({
			cls: "emotes-suggestion-label",
			text: value.label,
		});
		textWrap.createDiv({
			cls: "emotes-suggestion-shortcode",
			text: shortcodeText(value.shortcode),
		});
	}

	selectSuggestion(value: EmojiEntry): void {
		const shortcode = shortcodeText(value.shortcode);
		const context = this.context;
		if (!context) {
			return;
		}

		context.editor.replaceRange(shortcode, context.start, context.end);
		this.close();
	}
}
