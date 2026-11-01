# Pixel Pet Portfolio

A cozy pixel-art bedroom portfolio with a virtual pet cat. Built with **React + Vite + Phaser 3**.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
```

## What's in the room

Click anything and **Mochi the cat fetches it for you**: she runs over, hops, grabs the item,
carries it to the middle of the room and holds it up - *then* its panel opens. Close the panel
and she puts it back.

| Object          | Opens                 | Notes                                                        |
| --------------- | --------------------- | ------------------------------------------------------------ |
| Laptop          | My projects           |                                                              |
| Resume folder   | Resume panel          | Never downloads on its own - only the **Download** button does |
| Bookshelf       | Work experience       |                                                              |
| Photo frame     | About me              |                                                              |
| Phone           | Contact info          | mailto link + copy-to-clipboard                              |
| Board game      | **Tic Tac Toe**       | You are X, the cat plays paw prints. Sleepy / Normal / Genius |
| Retro console   | **Minesweeper**       | Easy / Normal / Hard. Ask Mochi to *sniff out* a safe square (3 per game) |

In both games the cat is on screen next to the board, talks, and reacts with her sprite
animations (thinks, pounces, celebrates, gets startled when you win or hit a mine).
Minesweeper: click = dig, right-click = flag; on touch, tap = dig and long-press = flag
(or use the Dig / Flag toggle).

**The cat** also wanders, naps on her bed, hops and spawns hearts when clicked, and can be
**picked up and dragged** - let go and she drops to the floor and walks back to her bed.

The whole page is the room (no header or button bar). A **Full screen** button in the corner
uses the browser's full-screen mode (not available on iPhone Safari). Keyboard / screen-reader
users get a hidden menu with the same sections - the cat still fetches them.

## Sound

Background music (a gentle lo-fi loop) and sound effects (meows, a purr, hops, the "ta-da" when the
cat presents an item, clicks, and sounds for both games). **Music** and **SFX** each have their own
toggle in the top-right corner, and your choice is remembered. Browsers block sound until the first
click or key press, so the music starts then.

Nothing is downloaded: every sound is synthesised in the browser (`src/audio/synth.js`) as a
placeholder. To use real recordings, drop files in `public/audio/` and list them in
`src/audio/config.js` - one sound at a time if you like (see `public/audio/README.md`).

## Make it yours

| I want to...                         | Edit                                  |
| ------------------------------------ | ------------------------------------- |
| Change any text, links, projects, cat dialogue | `src/content/portfolio.js`  |
| Replace my resume PDF                | `public/resume/resume.pdf`            |
| Swap the art (room, cat, objects)    | `public/assets/**` - see `public/assets/README.md` |
| Move objects / change the cat's bed  | `src/game/config/layout.js`, `cat.js` |
| Change cat speed, nap time, odds     | `src/game/config/cat.js`              |
| Change colours / panel styling       | `src/styles/global.css`               |
| Swap or retune sounds and music      | `src/audio/config.js`, `public/audio/`  |

## Project structure

```
src/
  content/portfolio.js     <- all your text (the file you'll edit most)
  components/              <- React UI: HUD, panels, cat avatar, game panels
    games/                 <- TicTacToePanel, MinesweeperPanel (UI only)
  games/                   <- pure game rules + cat AI (ticTacToe.js, minesweeper.js), no React
  audio/                   <- sound engine: audio.js (play/toggle), synth.js (placeholder sounds), config.js
  hooks/                   <- useGameEvent, useAudioSettings
  game/                    <- Phaser only. Knows nothing about React.
    EventBus.js            <- the single bridge between game and UI
    index.js               <- createGame()
    config/
      assets.js            <- asset manifest (files, sheet grid, animations)
      layout.js            <- object positions
      cat.js               <- cat tuning + states
    scenes/PreloadScene.js, RoomScene.js
    entities/Cat.js (incl. fetch behaviour), InteractiveObject.js, catAnimations.js
public/
  assets/                  <- placeholder art (replace freely)
  resume/resume.pdf        <- placeholder resume
scripts/generate_placeholders.py   <- how the placeholder art was made
```

### Game / UI separation

`src/game/**` never imports React and `src/components/**` never touches Phaser objects.
They only talk through `EventBus`:

- game -> UI: `object:hover`, `object:out`, `object:open` (the cat delivered the item), `cat:click`, `cat:say`, `cat:state`
- UI -> game: `ui:open` (ask the cat to fetch something), `ui:highlight`, `ui:panel` (pauses room input; closing sends the item back)

Positions sent to the UI are already in screen pixels, so overlays line up at any window size.
The mini-games' rules live in `src/games/` and know nothing about React or Phaser.

## Adding another game

1. Write the rules as pure functions in `src/games/yourGame.js`.
2. Build a panel in `src/components/games/YourGamePanel.jsx` (use `<CatSays>` for the cat).
3. Draw a sprite in `public/assets/objects/`, list it in `src/game/config/assets.js`, and add an
   entry (with a `fetchFrom` floor spot) to `OBJECTS` in `src/game/config/layout.js`.
4. Register the panel under the same id in `src/components/panels/index.js`.

## Notes

- Phaser is pinned to the 3.x line (`^3.90.0`).
- The canvas fills the window and the 320x180 room is zoomed to fit it, so on screens that are not
  16:9 you see dark bars at the sides or top. A portrait phone gets a small room - landscape is nicer
  (the page suggests it).
- If an asset fails to load, a magenta placeholder box is drawn and a console warning names the file.
