# Koneko for RemNote

A soft pastel cat theme. Costumed kittens rest in the corners of the window, and
a ball of yarn can roll across the bottom with a cat chasing it.

Four shades, five costumes, and a chase you can time.

## Install

`KonekoPlugin.zip` goes to Settings, Plugins, Build, Upload plugin. Because the
manifest declares a theme it also appears under Themes, with its settings under
Plugin Settings.

Build it with `npm install && npm run build`.

## Settings

| Setting | Options | Default |
| --- | --- | --- |
| Shade | Samecat, Ichigo, Matcha, Purin | Samecat |
| Corner cats | Off, Subtle, Normal, Bold | Normal |
| Costume | Shark, Bunny, Bread, Strawberry, No costume | Shark |
| Panel opacity | 0 to 100 | 75 |
| Tint strength | 0 to 200 | 100 |
| Yarn chase | On, Off | **Off** |
| Chase interval | 10 to 3600 seconds | 60 |
| Chase speed | Amble, Trot, Dash | Trot |

Tint strength is there for anyone who finds the pastels too pale. 100 is each
shade as designed; higher deepens the ground, lower washes it toward neutral.
Text colour does not move with it, so the range is capped at 200, which is where
the contrast floor still holds on every shade.

The corners hold a cat asleep on a shelf at the top left, a cat curled in its bed
at the bottom left, and a costumed pair at the bottom right. Costume picks the
featured cat of that pair; the other takes a different costume so the two are
never identical. The shelf and bed cats are fixed scenes, since a cat asleep on a
shelf belongs to that shelf.

The chase is off by default. Motion that crosses the window is charming once and
distracting afterwards, so you opt in. If your system asks for reduced motion it
stays still even when switched on.

The ball leads and the cat follows, always. The two share a speed and the cat
simply starts further back, so the gap is geometry and the cat cannot overtake at
any interval or speed.

Panel opacity drives `--current-background-color`, which is what RemNote paints
code blocks and the editor container with. At 0 there is no panel and content
sits on the artwork; at 100 it is solid.

## The artwork

Original drawings, not traced. The style is a reference, the characters are ours.

They are full colour SVGs with `{{TOKEN}}` placeholders, and the active palette
is substituted in before the SVG is encoded into a data URI. That is what lets
one drawing serve every shade while still carrying fur, tabby, eyes, pink and a
costume colour at once.

Everything is embedded in the stylesheet. No remote requests, so nothing here
knows when you are using RemNote and it all works offline. The decorative layers
are `position: fixed` with `pointer-events: none`, so they can never take a click.

## Development

Needs Node 24 or newer: the tests import TypeScript directly.

```bash
npm install
npm run preview   # a standalone page, no RemNote needed
npm run dev       # live server for Develop from localhost
```

`npm run dev` frees its own previous port, regenerates the artwork and the CSS on
change, and serves at `http://localhost:8080`.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run preview` | Build the standalone preview page |
| `npm run dev` | Live server on port 8080 |
| `npm run art` | Regenerate the artwork |
| `npm test` | Full test suite |
| `npm run verify` | Type check and test. Run before pushing |
| `npm run build` | Both zips |

## Versioning

Every change that ships bumps the version, including fixes and internal work, so
a build can be identified by its version alone.

## License

MIT. See [LICENSE](LICENSE).
