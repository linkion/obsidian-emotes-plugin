# Obsidian Sample Plugin

# Obsidian Emotes

Obsidian Emotes adds Discord-style shortcode support to Obsidian notes. Type `:heart:` and the plugin will show inline suggestions as you type. In reading view, shortcode text is rendered as the matching emoji while the source markdown stays unchanged.

## What works now

- Built-in emoji search from the Emojibase dataset.
- Cursor-relative autocomplete while typing a shortcode.
- Exact shortcode matches first, then fuzzy matches from labels and tags.
- Reading-view rendering of shortcode text to emoji glyphs.
- A registry-based pack loader scaffold for community emoji packs.

## How it behaves

- Keep typing shortcode text in your note.
- Select a suggestion to insert the shortcode, not the raw emoji.
- Search terms can match descriptions and tags, so `hello` can surface related emotes even when you do not know the exact shortcode.

## Community packs

Community packs are designed to live in a separate GitHub repo and be described by a standardized JSON manifest.

### Registry format

The plugin expects a central registry JSON file with this shape:

```json
{
	"schemaVersion": 1,
	"packs": [
		{
			"id": "base",
			"name": "Base pack",
			"version": "1.0.0",
			"manifestUrl": "https://example.com/packs/base/manifest.json",
			"description": "Starter emoji pack",
			"author": "Example Author"
		}
	]
}
```

### Pack manifest format

Each pack manifest is a JSON file with emoji assets stored alongside the manifest or reachable by relative URL:

```json
{
	"schemaVersion": 1,
	"id": "base",
	"name": "Base pack",
	"version": "1.0.0",
	"description": "Starter emoji pack",
	"author": "Example Author",
	"emojis": [
		{
			"shortcode": "wave",
			"label": "Wave",
			"keywords": ["hello", "greeting"],
			"asset": {
				"path": "wave.gif",
				"animated": true
			}
		}
	]
}
```

## Settings

- `Enable autocomplete` controls whether the inline picker appears.
- `Render shortcodes` controls whether shortcode text is replaced in reading view.
- `Registry URL` points at your central registry JSON.
- `Enabled pack IDs` selects which packs from the registry should be loaded.
- `Load remote packs on startup` fetches the registry when Obsidian opens.

## Development

- Install dependencies with `bun install`.
- Build with `bun run build`.
- Run the watch build with `bun run dev`.

## Release files

When you publish a release, include `main.js`, `manifest.json`, and `styles.css`.
