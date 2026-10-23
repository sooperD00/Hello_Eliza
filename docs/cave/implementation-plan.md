# Cave: implementation plan

The cave's delivery milestones. What each piece is and why is in [design.md](design.md), the formats
are in [interface-spec.md](interface-spec.md), and the play-throughs that settled the first rooms are
in [playthrough/](playthrough/).

Phase 0 is designed in full. Phases 1 and 2 are lists, designed when they come up. Deferred work
that isn't a feature lives in [techdebt.md](../sprints/techdebt.md).

## Phase 0 — "Into the House"

Someone who says yes to a game on the homepage lands in the cave, opens the mailbox, gets into the
house, and makes the gold leaves jump apart. The map and the journal record it.

### Build scope

1. **Spec catch-up.** Fold the play-through decisions into interface-spec.md and design.md before
   any code, so the code has one source.
   - Fields: trigger `reveals`, edge `nouns`, noun groups, verbs-only triggers, entry `long_text`,
     the `look` entry in the dictionary, the start square, and `revealed` in progress.
   - Engine rules: "it", the matching order, the unmet fix, repeated solves, the order on a solve, a
     panel that appears drawing what's already earned, a missing drawing file, hidden locked doors,
     and crossing a door marking both sides.
   - West of House solves on opening the mailbox. `read journal` prints the latest entry's
     `long_text`.
   - (round-1.md and round-2.md list each one with its proposal.)
2. **One matcher.** Pull the rule matcher out of zork.js into its own file (housekeeping already has
   this item), and grow it to the cave's trigger rules: whole words, dictionary synonyms, noun
   groups, phrases, and regex. The homepage and the cave both use it. Tested with `node --test`.
3. **Content files, served static.** house.json, verbs.json, and an engine.json (start square,
   commands, responses, easter eggs), under `wwwroot/cave/`. No API routes yet; the first one comes
   with the group index in Phase 1.
4. **The engine.**
   - Loads the world and runs the checks.
   - Matches easter eggs, then room triggers, then engine commands, then `no_match`.
   - Handles requires, steps, solves, and reveals.
   - Moves by compass word or landmark noun.
   - Commands: `go`, `look`, `look at`, `help`, `restart`, `read journal`.
   - Answers with `no_match` and `unmet` lines, and picks text from lists at random.
5. **The journal panel.** Hidden until revealed. One handwritten line per solved room,
   `year who: what`, with the summary on hover. A click opens one of the room's links at random in a
   new tab. Groups wait for Phase 1, so every entry sits loose.
6. **The map panel.** Hidden until revealed. Footprints, visited squares, creases, walls,
   boundaries, compass letters (red, then black), and each solved room's drawing inked stroke by
   stroke with plain CSS.
7. **Three drawings.** Line art, strokes only: the mailbox, Bennet's electroscope, and a default for
   Front of House. The default is one of Nicole's.
8. **Progress.** Saved in the browser and kept across visits: where you are, visited squares, solved
   rooms, steps, doors crossed, and panels revealed. `restart` clears it.
9. **The content pass.** The three rooms rewritten with many more options:
   - a look for everything the text names
   - answers to a newcomer's questions ("why am I here", "where am I", "what do I do") in the first
     rooms
   - more verbs
   - the open content questions settled: the jar room's name, Bennet's year, where the hum goes, and
     whether the E door waits for the map
10. **The page.** /cave becomes journal | map | terminal, desktop only, in place of the coming-soon
    art.

### Deliverables

- Saying yes on the homepage leads to /cave, and the three rooms play start to finish.
- Both play-throughs replay as an automated test: each command in, the expected room, text, and
  solve out. Round 2's misses become new commands in it once the content pass covers them.
- The checks in interface-spec.md run when the world loads, and the shipped world passes them.
- Progress survives a reload, and `restart` clears it.
- design.md and interface-spec.md describe what was built. Nothing the code depends on is still
  marked proposed.

## Phase 1 — "Take the Jar With You"

The game grows past one house: things to carry, more rooms, more worlds.

- Items: `take`, `inventory`, the inventory strip, counts and maximums, rooms that use items up, and
  the drop joke. The jar becomes takeable. The compass.
- The ruler, and measuring how far the leaves spread.
- Group boxes: reserved lines, the completion flash, the group's name, and the server's group index
  (the first API route).
- More worlds: portals and their phrases, world-edge doors, worlds and rooms that appear, rooms that
  take over a square, and one-way doors.
- Several possible entries per room, one picked and kept.
- Clicking an inked square scrolls the journal to its entry.
- Help when stuck: the dictionary's verbs, shown after enough turns or minutes in one room
  (settings.json).
- CI that runs the room checks on every world file.

## Phase 2 — "Build Your Own Room"

Players see how a room is made, and make their own.

- The room builder: the form, the dictionary as suggestions, the `is_clue` reminder and question,
  and the checks on submit.
- Your own files: save, load, and drag and drop.
- Feedback to a room's author. There's no place to keep it yet. Even "email the room's author" would
  do as a first version, but an address on a public page invites spam.
- An author's own expanded learning page, linked from their room's entry.
- Journal pages and a table of contents, once the journal outgrows a page.
- Puzzles that teach command languages:
  - shortcuts (`n`, `l`, `i`, `ls`, `cd`, `pwd`), unlocked by a room whose technology is the history
    behind them
  - vi: typing `vi` shows its commands in gray, and the player learns `i` for insert and the rest
    in a mini-game, maybe by editing the terminal's earlier text. Needs new engine logic.
- Characters, and the verbs that come with them: `give` (and `use`, maybe a synonym) takes an item
  out of the inventory. The lady in the house.
- Messages from outside arriving in the mailbox: fliers, letters, expansions.
