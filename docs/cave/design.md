# Cave: design

Why the cave is shaped the way it is. The formats are in [interface-spec.md](interface-spec.md);
this file holds the arguments, and it should change far less often.

The cave is a text adventure in the lineage of Zork and Myst, set in the forgotten science rooms
under a university: cruft hall, a physics basement, Kvothe's Underthing. Each puzzle is a real
experiment or invention. Solving one inks a square on a map and writes an entry in a journal.

## The shape of the game

```
game
├── authored                       written by a room author
│   ├── verb dictionary            one for the whole game
│   ├── engine responses           no match, unmet requirements, movement, look, help
│   └── worlds
│       └── world                  appears
│           └── room
│               ├── the place      solving the mystery
│               │   ├── name, coords, appears, text, drawing, gives
│               │   ├── edges      N E S W: kind, requires, to
│               │   ├── portals    to, color, requires
│               │   └── triggers   verbs, nouns, regex, requires, sets, say, solves
│               └── journal        looking back on what you learned
│                   ├── group
│                   ├── entries    year, who, what, summary (one is picked)
│                   └── links
├── saved                          the player's progress, in the browser
│   └── where you are, visited squares, solved rooms, inventory, steps per room
└── derived                        rebuilt from the two above, never stored
    ├── group index                the server reads every world file
    ├── journal                    solved rooms' entries, laid out in group boxes
    ├── map                        world shape + visited + solved
    └── inventory strip            solved rooms' gives
```

Only the authored files and the saved progress are real. Everything a player looks at is rebuilt
from them. Record the endpoints, reconstruct the rest.

## Components

| word | means | the player sees |
|------|-------|-----------------|
| `world` | a set of rooms with its own theme and its own map, loaded on its own | a floor, the woods, a wing |
| `room` | one puzzle to solve and learn from, at one map square (or a list of squares) | a place: a cellar, a clearing; never the word "room" |
| one big room | the world the player imagines from the map layout and the room text | not a data structure |
| `edge` | one side of a room's square; its `kind` says what it is | |
| `door` | an edge the player can cross | a passage; never the word "door" |
| `portal` | a way up, down, or elsewhere, inside a square | stairs, a ladder, a hatch |
| `trigger` | words a room answers to | |
| `item` | what a solved room gives | what's in your pockets |
| `journal` | a room's record: its group, its possible entries, its links | |
| `entry` | one possible record of a solved room | in science rooms, a `discovery` |
| `group` | rooms recorded together in the journal | in science rooms, a `technology` |
| `link` | a learning link: a page about the real thing | |

Player-facing text never says "room" or "door." The plumbing has doors on every side; the story
has a cellar, a hallway, a clearing.

`discovery` and `technology` are the teaching words, for rooms about real science. `entry` and
`group` are the general words, so other kinds of rooms fit on the map too: Front of House teaches
no discovery and still writes an entry.

# Authored

## Worlds

- Worlds start small. A world's edge doors can require an item, so the map grows as worlds open.
- Up and down are other worlds. A second floor is a different map, reached by a portal.
- Each world loads on its own, the way early games split a map that was too big to hold at once.
- A world can appear on a condition, the same way a room can.

## Rooms

A room has two halves, because an author designs it in two modes:

- **The place.** You design a room by imagining a literal 3D room: what's in it, what it looks like,
  what you do there, which ways lead out. That's the mystery the player solves.
- **The journal.** Only afterward, imagining the player looking back, do you see how the room gets
  recorded and which other rooms it groups with. Nobody cares about the group while they're
  solving.

A room owns everything about itself. The only things it doesn't own are game-wide: the verb
dictionary and the engine's responses.

### Rooms can take over a square

- A newer room appears only after the old room in its square is solved. The new one takes over the
  moment the old one is done, so there's never a question of which room shows.
- The newer room's drawing replaces the old one. The designer decides, room by room, whether to
  redraw the old object moved over, add to it, or replace it.

### Edges and portals

| kind | can cross | what it's for |
|------|-----------|---------------|
| `door` | yes, once its `requires` holds | a way through |
| `wall` | no | a side of the place |
| `boundary` | no | the edge of the world |
| (missing) | no | a mystery: something to unlock later |
| `window` | later | room left in the format for more kinds |

- Each room owns all four of its sides. Two neighbors can disagree, and a disagreement is a one-way
  door. That's the Zork trick, kept on purpose, because finding it out is a lesson in itself.
- A room says what an edge *is* (`kind`), and the map decides how to draw it. A new kind like
  `window` needs a new drawing and no room edits.
- A missing side means no way through yet. The player should get a hint that something is there
  to unlock later.
- Portals lead up, down, or to another world. They sit inside a square, not on its edges.

### Triggers: solving and matching

- Every trigger can have conditions, and one trigger per room is the solve.
- The solve can need nothing, or it can need earlier steps in the same room. There are no ordered
  step lists to track.
- Most puzzles are verb + noun. "I open the mailbox" opens it; "I look at the mailbox" doesn't,
  because *look* isn't one of its verbs.
- The plain word lists match whole words exactly, ignoring case and punctuation. They're the
  readable default for people learning to write rooms, and "nice" never fires "ice."
- Regex is for everything else: easter eggs, passwords with a twist, the things that aren't "I do
  the thing." Partial matching lives only there, in the field that looks like code.
- (The lineage: Colossal Cave Adventure in 1976 read two-word commands from a closed vocabulary.
  Zork, a year later, could parse "put the sword in the case." The cave sits between them.)

### Items connect rooms

- Rooms connect only through items.
- Steps inside a room stay in the room. "The knob was turned" never leaves the cellar.
- A room gives one item when it's solved, and players can't pick up anything else.
- A long chain (tap latex in the woods, vulcanize it at a furnace, stamp stoppers, then do vacuum
  experiments) needs no chain logic. Each room checks only for the item it needs. The inventory is
  the save file.
- A visitor's room can depend only on items, and items have names you can see. A visitor's room
  can't reach into the middle of yours.

### The room's journal

- The `journal` block holds the room's `group`, its possible `entries`, and its `links`.
- The group is said once, in the journal block, because that's where an author sees it.
- An entry has `year`, `who`, `what`, and `summary`, all optional. A room with no entry writes
  nothing in the journal.
- A room can hold several possible entries, and one is picked at random. Front of House has a shelf
  of postal history to choose from.
- Learning links are for further learning or rabbit holing. Clicking the room's journal entry opens
  one at random in a new tab: the homepage's coin flip, aimed at learning more about the real
  thing.

## Verb dictionary

- A small dictionary sits between the plain word lists and regex. Rooms name a plain verb, the
  dictionary holds its synonyms, and players see the short list as a helper when they don't know
  what to type.
- One dictionary for the whole game, so OPEN means the same thing in every world.

## Engine responses

What the game says when no room has an answer: nothing matched, a requirement isn't met, the
player moves, looks around, checks their pockets, or asks for help. These are game-wide and
written once, not per room. What they say is still open (questions 7–9).

# Saved

## Progress

- One player. No accounts, no auth.
- Progress saves in the browser and survives across visits: where you are, which squares you've
  visited, which rooms you've solved, your inventory, and each room's steps.

## Your own files

- Rooms a player builds are JSON files they save and load themselves. A web page can't open a
  folder by path, so Save downloads a file and Load takes one handed over (picker or drag-and-drop).
- Shared storage, accounts, and multiplayer can come later. The format shouldn't block them, and
  nothing gets built for them now.

# Derived

## Group index

- Rooms name their own group, and the server reconstructs the groups.
- The server reads every world file and builds the group list, years included, so the journal can
  reserve space for members in worlds that haven't loaded.
- Adding a room to a group is just adding the room.

## The journal

The journal is the player's discovery log. It logs and orders the player's actions and
achievements, first according to themes (what is rubber, and how is it made?) in the order a player
meets them. Second, it orders discoveries within each theme by the year they historically happened,
when a discovery is tied to a real event. That gives a record of the player's learning and action,
with historical context where it's relevant. It produces a journal a bit like the ones working
scientists and engineers keep: a conflict between thematic and chronological order.

- When a player enters a room whose group they haven't seen before, a new, blank group box is drawn
  under or next to the previous one, sized to the number of entries in the group.
- Entry slots inside a group box are ordered by `year`, but nothing is drawn in a slot until the
  player solves that room.
- When a player solves a room, its entry is animated into the slot reserved for it.
- When a player completes a group, its box is redrawn in a darker shade, it flashes, and the group's
  name is written at the top.

## The map

- Footprints mark the square the player is standing in.
- A square's edges are drawn only once the player has visited it.
- Each room draws its sides just inside its own square, so a one-way door shows a crease on one
  side of the edge and a wall on the other. The map teaches the trick.
- Portals are colored square outlines nested inside the square.
- A solved room's drawing is inked into its square, stroke by stroke.
- Clicking an inked square scrolls the journal to that room's entry. The map is the journal's table
  of contents.

## The inventory strip

A strip across the top of the journal and map, showing what's in the player's pockets.

# On screen

## Everything on one screen

- Journal | map | terminal | room builder, side by side, with the inventory strip across the top of
  the journal and map.
- With the journal always in view there's no zoom. The reveal is the map drawing the room's
  picture, then the journal handwriting the entry.
- The room builder is a form that fills in a new room record, so players see how a room is made and
  can make their own.

## A website, not an app

The cave is old-style computer stuff on a desktop screen. A phone version would be a different
design and probably a real app, and it's out of scope.

# The first room: Front of House

- (0,0) is Front of House and its mailbox. Opening the mailbox solves it, and what's inside is the
  journal with its fold-out map.
- Its drawing on the map is the journal itself, a picture that contains itself (*mise en abyme*).
- Non-discoveries like the mailbox still get journal entries. They're where the diffuse clues and
  rabbit holes go: postal history, Zork's own mailbox.

# Open questions

1. **Room identity.** Is a room's `name` also its ID (used by `solved` and by groups), or does it
   get a separate `id` so it can be renamed?
2. **`takes`.** Do items get used up (the latex turns into rubber), or do pockets only grow?
3. **Random journal picks.** Picked once at the solve and kept (ink doesn't change), or picked
   fresh each time?
4. **Links per entry.** Links live in the room's journal block. Should an entry be able to carry
   its own links too (the Trollope entry wants the Trollope link)?
5. **Ungrouped entries.** Where does an entry with no group go: its own one-slot box, or loose
   between boxes?
6. **Lists everywhere.** Can any text field (`say`, `text`) be a list with a random pick, the way
   the homepage rules work?
7. **Unmet requirements.** What does the engine say when a trigger's words match but its
   requirements aren't met?
8. **No match.** What does the engine say when nothing matches?
9. **Engine commands.** Which commands does the engine handle (go north, n, look, inventory, help)?
10. **Portals.** What does a player type to use one, and do the colors mean anything?
11. **Big rooms.** When a room covers several squares, which square's sides do its doors belong to?
12. **Items on screen.** Is an item in the inventory strip a word, or a small drawing?
13. **Reserved journal space.** Blank, or a faint hint (a year, an outline)?
14. **The unlock-later hint.** If a missing side draws nothing, how does the player learn that
    something is there?
15. **Line drawing.** SVG files animated with the plain CSS stroke trick (`stroke-dashoffset`), or
    a library like Vivus?
16. **The memory partition.** How much more obvious should the mailbox be?
17. **The boarded front door.** How does the player get from (0,0) into the house at (0,1)?
