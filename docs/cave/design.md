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
│   ├── engine                     commands, responses, easter eggs, settings
│   └── worlds
│       └── world                  appears
│           └── room
│               ├── the place      solving the mystery
│               │   ├── id, name, coord, appears, text, looks, drawing, takeable, takes
│               │   ├── edges      N E S W: kind, requires, to
│               │   ├── portals    to, color, requires
│               │   └── triggers   verbs, nouns, phrases, regex, requires, sets, say, solves
│               └── journal        looking back on what you learned
│                   ├── group
│                   ├── entries    year, who, what, summary (one is picked)
│                   └── links
├── saved                          the player's progress, in the browser
│   └── where you are, visited squares, solved rooms, inventory, steps per room,
│       journal picks, doors crossed
└── derived                        rebuilt from the two above, never stored
    ├── group index                the server reads every world file
    ├── journal                    solved rooms' entries, laid out in group boxes
    ├── map                        world shape + visited + solved + crossed
    └── inventory strip            what you took, minus what rooms took
```

Only the authored files and the saved progress are real. Everything a player looks at is rebuilt
from them. Record the endpoints, reconstruct the rest.

## Components

| word | means | the player sees |
|------|-------|-----------------|
| `world` | a set of rooms with its own theme and its own map, loaded on its own | a floor, the woods, a wing |
| `room` | one puzzle to solve and learn from, at exactly one map square | a place: a corner of a basement, a clearing; never the word "room" |
| one big room | the space the player imagines from the map layout and the room text | not a data structure |
| `edge` | one side of a room's square; its `kind` says what it is | |
| `door` | an edge the player can cross | a passage; never the word "door" |
| `portal` | a way up, down, or elsewhere, inside a square | stairs, a ladder, a hatch, a blue square |
| `trigger` | words a room answers to | |
| `item` | something a solved room lets you take, in a count | what's in your inventory |
| `journal` | a room's record: its group, its possible entries, its links | |
| `entry` | one possible record of a solved room | in science rooms, a `discovery` |
| `group` | rooms recorded together in the journal | in science rooms, a `technology` |
| `link` | a learning link: a page about the real thing | |

Player-facing text never says "room" or "door." The plumbing has doors on every side; the story
has a cellar, a hallway, a clearing.

`discovery` and `technology` are the teaching words, for rooms about real science. `entry` and
`group` are the general words, so other kinds of rooms fit on the map too: West of House teaches
no discovery and still writes an entry.

Two more words, for the people and the tools: the **author** is the person who writes a room, and
the **room builder** is the form on screen where they write it.

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
dictionary and the engine.

### One room, one square

- Every room object is one square: one coordinate, all the same size.
- A big space lives in the player's imagination, not in the data. One square has a desk and a lamp;
  the next has an easy chair and a window. They're "in the same room" for the player and the
  author, and the map says so with fold creases between them in place of solid lines.

### Room identity

- Every room has an `id`, the way every row in a table does. That's what IDs are for.
- World plus name must be unique too, so two rooms can't be confused on screen.
- Saved progress records IDs, so an author can rename a room without anyone losing progress.
- Rooms are self-contained objects that interact only the way parts of a distributed system do.
- Checks catch duplicates: the loader, the room builder, and later CI.

### Rooms can take over a square

- A newer room appears only after the old room in its square is solved. The new one takes over the
  moment the old one is done, so there's never a question of which room shows.
- The newer room's drawing replaces the old one. The author decides, room by room, whether to
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
- A missing side draws nothing, and the blank *is* the hint. Squares mark their ways out with
  compass letters, so a side with no letter and no line reads as "not yet."
- Portals lead up, down, or to another world. They sit inside a square, not on its edges. A
  portal's color is how a player can name it: "the blue square."

### Triggers: solving and matching

- Every trigger can have conditions, and one trigger per room is the solve.
- The solve can need nothing, or it can need earlier steps in the same room. There are no ordered
  step lists to track.
- Most puzzles are verb + noun. "I open the mailbox" opens it; "I look at the mailbox" doesn't,
  because *look* isn't one of its verbs.
- The plain lists match exactly, ignoring case and punctuation: word lists match whole words,
  phrase lists match the whole input. They're the readable default for people learning to write
  rooms, and "nice" never fires "ice."
- Regex is for everything else: easter eggs, passwords with a twist, the things that aren't "I do
  the thing." Partial matching lives only there, in the field that looks like code.
- (The lineage: Colossal Cave Adventure in 1976 read two-word commands from a closed vocabulary.
  Zork, a year later, could parse "put the sword in the case." The cave sits between them.)

### Looking at things

`look` on its own repeats the room's text, and the engine handles it. Looking *at* something needs
the author: the room lists the things worth looking at and what you see. That's where the
description lives that solving doesn't need but noticing does: the black mailbox, the red flag,
the house number.

### Deterministic on purpose

Some things happen every single time. Touch one particular board on the front door and a crow flies
overhead, every time. That teaches the player there's a deterministic engine behind the game, even
where random picks make it feel spontaneous. That's how life is, too: rain in November in the
Pacific Northwest is certain, even if nobody can say exactly when.

### Text can vary

- Any text a player reads (a room's `text`, a trigger's `say`, a `look`) can be one string or a
  list, and a list is picked fresh each time. That's the homepage's intermittent reward, carried
  down into the cave.
- The risk: a clue that's only in one variant can be missed. Text can be marked as a clue, and the
  room builder reminds the author that every variant has to carry it. The author decides; it's
  their room.

### Items connect rooms

- Rooms connect only through items.
- Steps inside a room stay in the room. "The knob was turned" never leaves the cellar.
- The game has an inventory, not pockets: no physics of what a body can carry. A player can still
  imagine pockets; the code and these docs say inventory.
- Solving a room makes its item takeable. The player still has to take it ("take the jar").
  Noticing that you *can* is a discovery of its own: experienced players try it right away, and a
  newcomer might need a hint hours in.
- A room can make several of an item takeable ("3 latex"), because one room's output can feed
  several later rooms. Each item has a maximum, so 3 latex is enough and 1000 never happens.
- A room can take items when it's solved. Latex gets used up and turns into rubber.
- Players can't pick up anything a room doesn't offer.
- There's no inventory management. It's the first thing players ignore in RPGs, for a reason: it's
  no fun. "Drop" gets a joke and the item stays where it is.
- A long chain (tap latex in the woods, vulcanize it at a furnace, stamp stoppers, then do vacuum
  experiments) needs no chain logic. Each room checks only for the items it needs. The inventory
  is the save file.
- A visitor's room can depend only on items, and items have names you can see. A visitor's room
  can't reach into the middle of yours.

### The room's journal

- The `journal` block holds the room's `group`, its possible `entries`, and its `links`.
- The group is said once, in the journal block, because that's where an author sees it.
- An entry has `year`, `who`, `what`, and `summary`, all optional. A room with no entry writes
  nothing in the journal.
- A room can hold several possible entries, and one is picked at random when the room is solved.
  Then it's kept: ink doesn't change. West of House has a shelf of postal history to choose from.
- Learning links are one list for the room. Every click on the room's journal entry opens another
  one at random in a new tab: the homepage's coin flip, aimed at learning more about the real
  thing. The fun is in the loose, slightly edgy correlation between them, so every link should
  relate to the room and to the others.
- Entries are short, with capped lengths. The box is sized one line per entry, so each entry has to
  fit its line, and the links carry the depth.

## Verb dictionary

- A small dictionary sits between the plain word lists and regex. Rooms name a plain verb, the
  dictionary holds its synonyms, and the engine accepts all of them.
- The dictionary is the shared vocabulary between author and player, a Simple English Wikipedia for
  both. The room builder shows it to authors so they remember to use the common verbs. The game
  shows it to players who seem stuck, which moves them from recalling a command to recognizing
  one.
- One dictionary for the whole game, so OPEN means the same thing in every world.
- It starts with only the verbs the first rooms need, and grows with the game.

## The engine

What the game does when no room is the answer. It's game-wide and written once.

### Commands

- Commands that do the same thing in every room belong to the engine: moving, looking around,
  taking, checking the inventory, help, restarting.
- The inspiration is three old command languages: Zork's, bash's, and vi's. There's no ranking
  among them, though it will probably fall out in that order.
- Players start with plain language: "look", "go north." Shortcuts come later, taught by a puzzle,
  and so do vi's commands. Both are tech debt for now.
- Using a portal has its own phrase list, from "use the portal" to "Second star to the right and
  straight on 'til morning."
- `restart` does what `reset` and `xyzzy` do on the homepage: *poof*, everything forgotten.

### Responses

- When nothing matches, or a trigger's words match but its requirements don't hold, the engine
  answers with a quote from science fiction, picked at random. Each case has its own list.
- Help comes in two kinds. Commands that do the same thing everywhere are the engine's. Common
  verbs are the dictionary's, shown to a player who has spent a long time in one room or taken
  many turns there without solving it. Both thresholds live in one settings file, where they're
  easy to change.

### Easter eggs

Zork's and Adventure's magic words open the page about them in a new tab: `xyzzy`, `plugh`, `hello
sailor`, `zork`, and Warren Robinett, who signed his name in a secret room in Atari's *Adventure*
(1980), one of the earliest known video game easter eggs.

### Shared with Eliza

The homepage's rules and the cave's triggers already have the same shape: words or regex in, a
reply picked from a list out. The test plan in housekeeping already pulls the rule matcher out of
`zork.js`. The cave should reuse it rather than grow a second one. How much more they share
(reset, easter eggs, response lists) gets settled in the implementation plan.

# Saved

## Progress

- One player. No accounts, no auth.
- Progress saves in the browser and survives across visits: where you are, which squares you've
  visited, which rooms you've solved, your inventory with counts, each room's steps, which journal
  entry each solved room got, and which doors you've crossed.

## Your own files

- Rooms a player builds are JSON files they save and load themselves. A web page can't open a
  folder by path, so Save downloads a file and Load takes one handed over (picker or drag-and-drop).
- Shared storage, accounts, multiplayer, and sending feedback to a room's author can come later.
  The format shouldn't block them, and nothing gets built for them now.

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

- Once found, the journal is always open in the leftmost column. Unlike Zork, the cave has helper
  panels, so reading the journal is just reading it.
- When a player enters a room whose group they haven't seen before, a new, blank group box is drawn
  under or next to the previous one, sized one line per entry in the group.
- Reserved lines stay blank. It's a mystery, and the box itself is the hint.
- Entry lines inside a group box are ordered by `year`, but nothing is drawn on a line until the
  player solves that room.
- When a player solves a room, its entry is animated onto the line reserved for it.
- When a player completes a group, its box is redrawn in a darker shade, it flashes, and the group's
  name is written at the top.
- An entry with no group sits loose between the boxes.
- The first few rooms fit on one page. Pages, and a table of contents, come when the game grows.

## The map

- Footprints mark the square the player is standing in.
- A square's edges are drawn only once the player has visited it.
- Each room draws its sides just inside its own square, so a one-way door shows a crease on one
  side of the edge and a wall on the other. The map teaches the trick.
- Each visited square marks its doors with small compass letters (N, E, S, W): red for a door the
  player hasn't gone through yet, black once they have.
- Portals are colored square outlines nested inside the square.
- A solved room's drawing is inked into its square, stroke by stroke. The drawings are line art,
  strokes only, which is what lets them draw themselves; hatching and cross-hatching do the shading.
- A room without its own drawing gets one from a folder of default drawings, funny ones, supplied
  by Nicole.
- Clicking an inked square scrolls the journal to that room's entry. The map is the journal's table
  of contents.

## The inventory strip

A strip across the top of the journal and map. Each item is a small drawing with its name
underneath, and a count when there's more than one. Items are more colorful and more solid than the
map's line drawings, so the two never get confused.

# On screen

## Everything on one screen

- Journal | map | terminal | room builder, side by side, with the inventory strip across the top of
  the journal and map.
- With the journal always in view there's no zoom. The reveal is the map drawing the room's
  picture, then the journal handwriting the entry.

## The room builder

- A form where an author fills in a new room record, so players see how a room is made and can make
  their own.
- It shows the verb dictionary as suggestions, so authors remember the verbs players will try.
- Above every text box, a small gray note: "Is this a clue? Remember: every variant has to carry
  the clues."
- On submit, a field marked as a clue with several variants gets one question: "You made multiple
  options in this field and it's marked clue. Do they all give the same clue, no matter which
  variation the player gets?" Yes or no, and the author's answer stands.

## A website, not an app

The cave is old-style computer stuff on a desktop screen. A phone version would be a different
design and probably a real app, and it's out of scope.

# The first rooms

The minimum game is the first few rooms: from the setup, through some easy learning, into the house,
and through the gold leaf puzzle.

## West of House

- It opens the way Zork opens, word for word: "**West of House.** You are standing in an open field
  west of a white house, with a boarded front door. There is a small mailbox here." (Zork I's source
  has been MIT-licensed since November 2025.)
- The mailbox goes further than Zork's. It's black with a red flag, its house number is 2112, and
  "memory" is painted on its side in white letters: a callback to Eliza's memory partition, and a
  nod to the journal and to all written text as cognitive offloading.
- The player types what Zork players typed: "open mailbox", "read journal".
- Inside the mailbox is the journal with its fold-out map. Reading it opens the journal into its
  column and solves the room. The game has started.
- Its drawing on the map is the journal itself, a picture that contains itself (*mise en abyme*).
- Its journal entry is a non-discovery, which is where the diffuse clues and rabbit holes go:
  postal history, Zork's own mailbox.
- Later, the mailbox is where messages from outside the world can arrive: fliers, letters,
  expansions.

## Front of House

- Its own square, at the boarded front door. Here the player decides whether to go into the house.
- The door opens in the cave, unlike Zork's. The boards stay.
- It teaches a few more verbs than the mailbox. The boards do things, deterministically: touch one
  particular board and a crow flies overhead, every time.
- Doors and locks as a real subject wait for a door inside the house.

## The gold leaf jar

- The first real puzzle, inside the house: the gold leaf electroscope.
- There's a ruler. Measuring how far the leaves spread goes into the journal entry as a
  representative number, from the historical measurement.
- Solving it inks the drawing and writes the entry. Then the jar is takeable, which is a second
  discovery. Much later, taking it "up" (a tree, a balloon) and measuring again gives a different
  number: the way to other worlds.

# Settle in the play-through

1. Where the first three squares sit on the grid.
2. Front of House's puzzle: how the door opens, and what the boards do.
3. The jar room's content: the experiment, the measurement, the number.
4. The command and verb set the first rooms need.
5. What's in the minimum game and what waits. That becomes the implementation plan.
