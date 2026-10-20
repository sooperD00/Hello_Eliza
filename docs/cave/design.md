# Cave: design

Why the cave is shaped the way it is. The formats are in [interface-spec.md](interface-spec.md);
this file holds the arguments, and it should change far less often.

The cave is a text adventure in the lineage of Zork and Myst, set in the forgotten science rooms
under a university: cruft hall, a physics basement, Kvothe's Underthing. Each puzzle is a real
experiment or invention. Solving one inks a square on a map and writes an entry in a journal.

## Components

| word | means | never |
|------|-------|-------|
| `room` | one puzzle to solve and learn from, at one map square (or a list of squares) | shown to players |
| one big room | the world the player imagines from the map layout and the room text | a data structure |
| `world` | a set of rooms with its own theme and its own map, loaded on its own | |
| `door` | a side of a room's square the player can cross | shown to players |

Player-facing text never says "room" or "door." The plumbing has doors on every side; the story
has a cellar, a hallway, a clearing.

## Worlds

- Worlds start small and load on their own
- A world's edge doors can require an item, so the map starts small and grows as worlds open.
- Up and down are other worlds. A second floor is a different map, reached by a portal.
- Each world loads separately, the way early games split a map that was too big to hold at once.
- A world can also appear on a condition, the same way a room can.

## Rooms

What do rooms "contain" and what are we here to do in the room? what do they look like?
what kind of edges can they have?

A room owns: everything except the general responses when there's no puzzle progression
and the synonym dicts. INcluding: edges, journal entries (including groups), what else is
in the schema for a room? groups.

room logical connection:

- Rooms connect only through items
- Steps inside a room stay in the room. "The knob was turned" never leaves the cellar.
- The only thing that crosses rooms is the inventory. A room gives one item when it's solved, and
  players can't pick up anything else.
- A long chain (tap latex in the woods, vulcanize it at a furnace, stamp stoppers, then do vacuum
  experiments) needs no chain logic. Each room checks only for the item it needs. The inventory are
  the save file.
- A visitor's room can depend only on items, and items have names you can see. A visitor's room
  can't reach into the middle of yours.

Generalization / Expansion
- Rooms can take over a square
- A newer room appears only after the old room in its square is solved. The new one takes over the
  moment the old one is done, so there's never a question of which room shows.
- The newer room's drawing replaces the old one. The designer decides, room by room, whether to
  redraw the old object moved over, add to it, or replace it.

## Edges

The `kinds` of edges in a table and how each one works

- `doors` -- how doors work
- `undefined` -- An undefined side draws nothing: white space, a mystery, and no way through yet. The player
  should get a hint that something is there to unlock later.
- Each room owns all four of its sides. Two neighbors can disagree, and a disagreement is a one-way
  door. That's the Zork trick, kept on purpose, because finding it out is a lesson in itself.
- Each room draws its sides just inside its own square, so a one-way door shows a crease on one
  side of the edge and a wall on the other. The map teaches the trick.
- A room says what an edge *is* (`kind`), and the map decides how to draw it. A new kind like
  `window` needs a new drawing and no room edits.

## The journal

The journal is the player's discovery log. It logs and orders the player's actions and
achievments, first according to themes (e.g. what is rubber and how is it made?) in the order
a player encounters them. And secondly it orders player discoveries within those themes according
to the actual year that the scientific `discoveries` historically happened, if the discovery is
associated with a real event. This gives a record of player learning and action, as well as 
historical context where relevant. This produces a journal a bit like like how working scientists 
and engineers make real entries — a conflict between thematic and datetime ordering.

Events
- Each `room` has a structured journal `entry` with `group`, `year`, `who`, `what`, and `summary`.
- All `entry` fields are optional. A room with no `entry` fields writes no `entry`.
- When a player enters a `room` that contains a `group` the player has not seen before, a new
  and blank `group` box is drawn in the journal under or next to the previous `group` box, sized 
  to the number of `entries` that `group` has
- `Entry` slots within their `group` box are ordered by `year`, but not drawn until the player solves
  the `room` associated with the `entry`.
- When a player completes a `room` (solves its puzzle), its journal `entry` is animated inside its
  `group` box, in the slot reserved for it
- When a player completes a `group`, its bounding box is redrawn in a darker shade, it flashes,
  and then the group's name is written at the top of the box.
- A `discovery` is a real scientific discovery, usually one to a room, with `discoveries` chained 
  to make up a `technology`. For example, the `technology`: rubber stopper is the `discoveries`: 
  latex + vulcanization + stamping.
- Each room has a list of `learning links` for further learning or rabbit holing. When a player
  clicks a journal `entry`, one of the links opens at random in a new tab: the homepage's coin
  flip, aimed at learning more about the real thing.

Generalization
- I've supplied a specific set of words for designing `rooms` with the intention of teaching 
  about actual technologies (`discovery`, `technology`)
- `entry` and `group` are more general terms so other kinds of `rooms` can also be added to the
  map (e.g. the starting `room` "Front of House" is not related to and does not teach a scientific
  discovery).
- A `room` can hold several possible journal `entries`, with one picked at random by application
  logic. e.g. the "Front of House" `room` has a list of `entries` from postal history to choose from.

Application Logic
- `groups` is specified in their `rooms`, and the server reconstructs them
- The server reads every world file and builds the group list, years included, so the journal can
  reserve space for members in worlds that haven't loaded.
- Adding a room to a group is just adding the room. Record the endpoints, reconstruct the rest.

## The map

## The first room is "Front of House"

- (0,0) is "Front of House" and its mailbox. Opening the mailbox solves it, and
  what's inside is the journal with its fold-out map.
- Its drawing on the map is the journal itself, *mise en abyme*.
- Non-discoveries like the mailbox still get journal entries. They're where the diffuse clues and
  rabbit holes go: postal history, Zork's own mailbox.

## Items and Inventory 

- Rooms connect only through items
- Steps inside a room stay in the room. "The knob was turned" never leaves the cellar.
- The only thing that crosses rooms is the inventory. A room gives one item when it's solved, and
  players can't pick up anything else.
- A long chain (tap latex in the woods, vulcanize it at a furnace, stamp stoppers, then do vacuum
  experiments) needs no chain logic. Each room checks only for the item it needs. The inventory are
  the save file.
- A visitor's room can depend only on items, and items have names you can see. A visitor's room
  can't reach into the middle of yours.

## A solve is one condition

- Every trigger can have conditions, and one trigger per room is the solve.
- The solve can need nothing, or it can need earlier steps in the same room. There are no ordered
  step lists to track.


## Matching what players type

- Most puzzles are verb + noun. "I open the mailbox" opens it; "I look at the mailbox" doesn't,
  because *look* isn't one of its verbs.
- The plain word lists match whole words exactly, ignoring case and punctuation. They're the
  readable default for people learning to write rooms, and "nice" never fires "ice."
- Regex is for everything else: easter eggs, passwords with a twist, the things that aren't "I do
  the thing." Partial matching lives only there, in the field that looks like code.
- A small verb dictionary sits between the two. Rooms name a plain verb, the dictionary holds its
  synonyms, and players see the short list as a helper when they don't know what to type. One
  dictionary for the whole game, so OPEN means the same thing in every world.
- (The lineage: Colossal Cave Adventure in 1976 read two-word commands from a closed vocabulary.
  Zork, a year later, could parse "put the sword in the case." The cave sits between them.)

## Single player, files you own

- One player. No accounts, no auth.
- Progress saves in the browser and survives across visits.
- Rooms a player builds are JSON files they save and load themselves. A web page can't open a
  folder by path, so Save downloads a file and Load takes one handed over (picker or drag-and-drop).
- Shared storage, accounts, and multiplayer can come later. The format shouldn't block them, and
  nothing gets built for them now.

## Everything on one screen

- Journal | map | terminal | room builder, side by side, with the inventory as a strip across the
  top of the journal and map.
- With the journal always in view there's no zoom. The reveal is the map drawing the room's
  picture, then the journal handwriting the entry.
- Clicking an inked square scrolls the journal to that room's entry. The map is the journal's
  table of contents.
- The room builder is a form that fills in a new room record, so players see how a room is made
  and can make their own.

## A website, not an app

The cave is old-style computer stuff on a desktop screen. A phone version would be a different
design and probably a real app, and it's out of scope.

## Open questions

1. **Room identity.** Is a room's `name` also its ID (used by `solved` and by groups), or does it
   get a separate `id` so it can be renamed?
2. **`takes`.** Do items get used up (the latex turns into rubber), or do pockets only grow?
3. **Random journal picks.** Picked once at the solve and kept (ink doesn't change), or picked
   fresh each time?
4. **Links.** One list per room, or a list per journal possibility (the Trollope entry wants the
   Trollope link)?
5. **Lists everywhere.** Can any text field (`say`, `text`) be a list with a random pick, the way
   the homepage rules work?
6. **Unmet requirements.** What does a trigger say when its words match but its requirements
   aren't met?
7. **No match.** What does a room say when nothing matches?
8. **Engine commands.** Are movement (go north, n), look, inventory, and help handled by the engine
   rather than by rooms?
9. **Portals.** What does a player type to use one, and do the colors mean anything?
10. **Big rooms.** When a room covers several squares, which square's sides do its doors belong to?
11. **Items on screen.** Is an item in the inventory strip a word, or a small drawing?
12. **Reserved journal space.** Blank, or a faint hint (a year, an outline)?
13. **The unlock-later hint.** If an undefined side draws nothing, how does the player learn that
    something is there?
14. **Line drawing.** SVG files animated with the plain CSS stroke trick (`stroke-dashoffset`), or
    a library like Vivus?
15. **The memory partition.** How much more obvious should the mailbox be?
16. **The boarded front door.** How does the player get from (0,0) into the house at (0,1)?
