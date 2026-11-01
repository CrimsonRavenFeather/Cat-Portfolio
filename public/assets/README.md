# Replacing the placeholder art

Every file here is a placeholder. Drop in your own file **with the same name** and the game
uses it - no code changes needed as long as the size matches. If your new image has a different
size, update the numbers noted below.

All images should be PNGs with transparency, drawn with no anti-aliasing / smoothing.
The manifest that lists them is `src/game/config/assets.js`.

## Room - `room/room.png`
- Placeholder size: 320 x 180. **Any 16:9 image works**: it is stretched to the game area,
  so a 640x360 or 960x540 redraw drops in with no changes.
- Furniture that must stay clickable (laptop, folder, bookshelf, frame, phone) are separate
  images placed on top; if you redraw the room, check their positions in `src/game/config/layout.js`.

## Cat - `cat/cat-sheet.png`
A grid of **32 x 32** frames, **6 columns x 5 rows** (192 x 160). One animation per row,
the cat faces **right** (the game flips it to walk left), paws touch the ground around **y = 28**.

| Row | Animation | Frames | Notes                                  |
| --- | --------- | ------ | -------------------------------------- |
| 0   | idle      | 4      | sitting, tail swish, blink             |
| 1   | walk      | 6      | side view                              |
| 2   | sleep     | 4      | curled up, breathing, floating "z"s    |
| 3   | react     | 4      | clicked: happy face (game adds the hop)|
| 4   | drag      | 2      | dangling while held                    |

Different frame size or layout? Edit `CAT_SHEET` and `CAT_ANIMS` in `src/game/config/assets.js`
(and `frameSize` / `feetY` in `src/game/config/cat.js`).

## Objects - `objects/`
| File            | Placeholder size | Position set in `layout.js` |
| --------------- | ---------------- | --------------------------- |
| `laptop.png`    | 32 x 24          | `projects`                  |
| `folder.png`    | 26 x 18          | `resume`                    |
| `bookshelf.png` | 44 x 84          | `experience`                |
| `frame.png`     | 26 x 28          | `about`                     |
| `phone.png`     | 12 x 20          | `contact`                   |
| `tictactoe.png` | 30 x 22          | `tictactoe` (floor item)    |
| `minesweeper.png` | 18 x 26        | `minesweeper` (floor item)  |

Each object also has a `fetchFrom` floor spot in `layout.js`: where the cat stands to grab it.
When fetched, the image is shrunk to fit above her head, so big images are fine.

Different size? Each object is anchored by its `originX/originY` (0.5/1 = bottom centre, so it
"sits" on its `x,y`). You can also add `scale: 0.5` to an entry to shrink a higher-resolution image.

## Effects - `fx/`
`heart.png` (hearts when the cat is clicked), `sparkle.png` (twinkle above clickable objects),
`shadow.png` (soft shadow under the cat), `favicon.png` (browser tab icon).

## About-page photo
The About panel uses `about.photo` in `src/content/portfolio.js` (defaults to `objects/frame.png`).
Point it at your own picture, e.g. put `me.png` in `public/assets/profile/` and set
`photo: `${BASE}assets/profile/me.png``.

## Resume
`public/resume/resume.pdf` is a placeholder PDF. Replace it (keep the name, or change
`resume.file` / `resume.downloadName` in `src/content/portfolio.js`).

## Regenerating the placeholders
`npm run assets:generate` (needs Python 3 + Pillow, and `reportlab` for the PDF) rewrites
everything in this folder - don't run it after you've added your own art.
