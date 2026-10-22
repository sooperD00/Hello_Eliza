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
│               │   ├── name, coord, appears, text, looks, drawing, gives, takes
│               │   ├── edges      N E S W: kind, requires, to
│               │   ├── portals    to, color, requires
│               │   └── triggers   verbs, nouns, phrases, regex, requires, sets, say, solves
│               └── journal        looking back on what you learned
│                   ├── group
│                   ├── entries    year, who, what, summary (one is picked)
│                   └── links
├── saved                          the player's progress, in the browser
│   └── where you are, visited squares, solved rooms, inventory, steps per room, journal picks
└── derived                        rebuilt from the two above, never stored
    ├── group index                the server reads every world file
    ├── journal                    solved rooms' entries, laid out in group boxes
    ├── map                        world shape + visited + solved
    └── inventory strip            what solved rooms gave, minus what they took
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
| `item` | what a solved room gives, in a count | what's in your inventory |
| `journal` | a room's record: its group, its possible entries, its links | |
| `entry` | one possible record of a solved room | in science rooms, a `discovery` |
| `group` | rooms recorded together in the journal | in science rooms, a `technology` |
| `link` | a learning link: a page about the real thing | |

Player-facing text never says "room" or "door." The plumbing has doors on every side; the story
has a cellar, a hallway, a clearing.

`discovery` and `technology` are the teaching words, for rooms about real science. `entry` and
`group` are the general words, so other kinds of rooms fit on the map too: West of House teaches
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
dictionary and the engine.

### One room, one square

- Every room object is one square: one coordinate, all the same size.
- A big space lives in the player's imagination, not in the data. One square has a desk and a lamp;
  the next has an easy chair and a window. They're "in the same room" for the player and the
  author, and the map says so with fold creases between them in place of solid lines.

### Room identity

- A room's ID is its world plus its name. Rooms are self-contained objects that interact only the
  way parts of a distributed system do, so a name is enough.
- Checks catch duplicates: the loader, the room builder, and later CI.
- The cost: saved progress records rooms by name, so renaming a room after people have played it
  forgets their progress there. A separate `id` can come later if that starts to hurt.

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
- It's an inventory, not pockets: no physics of what a body can carry. Inventory is a game
  thing, and that's all it is.
- A room gives an item when it's solved, in a count ("give the player 3 latex"), because one
  room's output can feed several later rooms. Each item has a maximum, so 3 latex is enough and
  1000 never happens.
- A room can take items when it's solved. Latex gets used up and turns into rubber.
- Players can't pick up anything a room doesn't give.
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
- Entries are short. The box is sized one line per entry, so each entry has to fit its line, and
  the links carry the depth.

## Verb dictionary

- A small dictionary sits between the plain word lists and regex. Rooms name a plain verb, the
  dictionary holds its synonyms, and the engine accepts all of them.
- The dictionary is the shared vocabulary between author and player, a Simple English Wikipedia for
  both. The room builder shows it to authors so they remember to use the common verbs. The game
  shows it to players who seem stuck, which moves them from recalling a command to recognizing
  one.
- One dictionary for the whole game, so OPEN means the same thing in every world.

## The engine

What the game does when no room is the answer. It's game-wide and written once.

### Commands

- Commands that do the same thing in every room belong to the engine: moving, looking around,
  checking the inventory, help, using a portal.
- They copy Zork's, shortcuts included (N, E, L, I, Q).
- Extra shortcuts teach real tools: Unix commands (`ls`, `cd`, `pwd`, `cat`, `man`) and vi
  (`:q`, `hjkl`). A player who learns them here can use them at a real prompt.
- Using a portal has its own phrase list, from "use the portal" to "Second star to the right and
  straight on 'til morning."

### Responses

- When nothing matches, or a trigger's words match but its requirements don't hold, the engine
  answers with a quote from science fiction, picked at random. Each case has its own list.
- Help comes in two kinds. Commands that do the same thing everywhere are the engine's. Common
  verbs are the dictionary's, shown to a player who has spent a long time in one room or taken
  many turns there without solving it. Both thresholds live in one settings file, where they're
  easy to change.

### Easter eggs

Zork's and Adventure's magic words get answers: `xyzzy`, `plugh`, `hello sailor`, `zork`, and Warren
Robinett, who signed his name in a secret room in Atari's *Adventure* (1980), one of the earliest
known video game easter eggs.

# Saved

## Progress

- One player. No accounts, no auth.
- Progress saves in the browser and survives across visits: where you are, which squares you've
  visited, which rooms you've solved, your inventory with counts, each room's steps, and which
  journal entry each solved room got.

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

- When a player enters a room whose group they haven't seen before, a new, blank group box is drawn
  under or next to the previous one, sized one line per entry in the group.
- Reserved lines stay blank. It's a mystery, and the box itself is the hint.
- Entry lines inside a group box are ordered by `year`, but nothing is drawn on a line until the
  player solves that room.
- When a player solves a room, its entry is animated onto the line reserved for it.
- When a player completes a group, its box is redrawn in a darker shade, it flashes, and the group's
  name is written at the top.
- An entry with no group sits loose between the boxes.

## The map

- Footprints mark the square the player is standing in.
- A square's edges are drawn only once the player has visited it.
- Each room draws its sides just inside its own square, so a one-way door shows a crease on one
  side of the edge and a wall on the other. The map teaches the trick.
- Each visited square marks its doors with small black compass letters (N, E, S, W). When a newer
  room takes over a square and opens a way that wasn't there before, that letter is red until the
  player goes through it.
- Portals are colored square outlines nested inside the square.
- A solved room's drawing is inked into its square, stroke by stroke. The drawings are line art,
  plain strokes, which is what lets them draw themselves.
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

- A form that fills in a new room record, so players see how a room is made and can make their own.
- It shows the verb dictionary as suggestions, so authors remember the verbs players will try.
- Above every text box, a small gray note: "Is this a clue? Remember: every variant has to carry
  the clues."
- On submit, a field marked as a clue with several variants gets one question: "You made multiple
  options in this field and it's marked clue. Do they all give the same clue, no matter which
  variation the player gets?" Yes or no, and the author's answer stands.

## A website, not an app

The cave is old-style computer stuff on a desktop screen. A phone version would be a different
design and probably a real app, and it's out of scope.

# The first room: West of House

- It opens the way Zork opens, word for word: "**West of House.** You are standing in an open field
  west of a white house, with a boarded front door. There is a small mailbox here." (Zork I's source
  has been MIT-licensed since November 2025.)
- The mailbox goes further than Zork's. It's black with a red flag, its house number is 2112, and
  "memory" is painted on its side in white letters: a callback to Eliza's memory partition, and a
  nod to the journal and to all written text as cognitive offloading.
- The player types what Zork players typed: "open mailbox", "read journal".
- Opening the mailbox solves the room, and what's inside is the journal with its fold-out map.
- Its drawing on the map is the journal itself, a picture that contains itself (*mise en abyme*).
- Its journal entry is a non-discovery, which is where the diffuse clues and rabbit holes go:
  postal history, Zork's own mailbox.
- The house is to the east, as in Zork. With east as +x, the house is at (1,0).

# Open questions

1. **The front door.** In Zork, the boarded front door never opens; players walk around the house
   and climb in through a kitchen window. Does the cave keep the boards, or let east go straight
   in?
2. **`l` means two things.** Zork's L is look; vi's l is "move right" (east). Which wins, or does vi
   movement stay out?
3. **Reading items.** What does "read journal" do: show the journal column, highlight the latest
   entry, both?
4. **Dropping.** Inventory only shrinks when a room takes. What does the engine say to "drop
   latex"?
5. **Restart.** "restart" wipes saved progress. Ask "are you sure?" first?
6. **Entry length.** One line per entry: how many characters? See the proposal in the spec.
7. **Easter egg answers.** What does each magic word say back?


# Answers Round 2

1. delete the separate room `id` from techdebt and make it part of design -- the player progress issue convinced me why it's important, and it's nbd to have ids, it's a normal part of tables and that's what it's for
2. our door opens -- maybe there is a "room" = "Front of House" so the player can open the door. Yes,
I decide this now, because the mailbox is a place where messages from like... outside the world
can appear on expansions (fliers, letters, things like that) in future. And "Front of House"
is a place where the player can decide to enter the house or not, and we can use the square
to teach more verbs than the mailbox one. (e.g. mailbox should be obvious, door should have a
couple more things the user can do -- just easter eggy stuff, though learning about doors and
locks is a fun thing too, but not for a 2nd square -- we'll leave that for a different door
inside the house). So, keep the boards, but add a couple things that maybe the boards do, or
like you touch a board and a crow flies overhead and you hear whatever. It should happen
every time you touch a specific board to teach the user that, this is a game, there is a
deterministic engine behind the game, even if we used tricks and "random" picks to simulate
spontenaity, which... actually that's how life is, isn't it? I expect it to rain in November
in the PNW, even if I can't predict exactly when and how.
3. Fix to "Gargle" blaster
4. Keep "pockets" in this case, because it's alliterative / a metaphore / imagination. The
*game* (and the official docs describing actually-implemented code objects) has `inventory`, 
but you can *imagine* yourself with *pockets* as you are playing (or not).
5. cap the entry length like you said
6. red as uncrossed doors in general is good design -- decided
7. yes, plain css. I understand no fill -- there is hatching and cross hatching if we need it
8. check where you used phrases like "the room builder" because "builder" read to me as software,
the app. Use "the author" to mean "the person that creates the room content".
9. room gets an actual ID; world and name combo is required unique.
10. drawing needs a default folder with some funny "random" drawings in there (that I will supply,
but put that in the design so that it gets included in an actual sprint later).
11. what is this? (| `gives` | gift | no | goes into the inventory when the room is solved |). I
was too young to play actual zork. I kinda just wanted something like the bell jar to become
a takeable item when the room is solved... I didn't want to player to just "get" it. I wanted
them to have to think about taking it and try to take it. I don't know why we need a "gift"
mechanic beyond a "take" or "drop" mechanic. If there are NPCs in the game, you could "give"
them something, which means it would come *out* of inventory, and "use" would do the same
when building or making something, and maybe "give" and "use" should be synonyms? Because solving
the gold foil experiment is a simple puzzle. But there is a ruler there -- they have to measure
the distance, and that gets recorded in the journal as (I have to do research -- whatever the
actual discovery measured) including some representative number. But then, later in the game,
when the player is meant to discover up / down other worlds, they are meant to "take" the jar
and bring it "up" a tree or "up" in a baloon or whatever and see a different number (maybe the
jar has a ruler drawn on it, idk, that's content design later) but what I mean is, solving the
puzzle and getting the reward of the drawing and the journal entry is a reward for the first
real puzzle room. But then realizing that you can *take* the jar into your inventory is another
discover. Experienced gamers will probably try to take it right away, but n00bs like myself
might take a while and require a hint hours into gameplay ;) Currently there are no NPCs, so we
don't need to design every verb now -- keep an MVP set that will be for the first couple "rooms"
(I guess we should play in the chat before deciding which are MVP and which are for later and
splitting them in the design doc or moving the out of scope ones to techdebt).

ok now I've read the give section in design.md -- maybe you are saying "give" is just what the room *can* give (and therefore what a player can "take" by typing "take <item>", not that the item immediately shows up in the players inventory -- I think that's probably the mechanic that I'm imaginging and straighforward to implement.
12. regarding zork vs vi conflicts -- Let's write the inspiration and learning of zork, bash,
and vi like you did; we don't have to define a heirarchy but I think it will likely fall out as
zork, bash, and vi; but I can also imagine a puzzle that *unlocks* vi-type commands, and the
player would learn to do like type vi, press enter, some options are shown to the user in gray
font (vi commands), then the user learns to type i for insert etc etc in a mini-came. This can 
be techdebt idea for a future puzzle, which may require new logic and implementation -- I can
imagine letting the user edit the previous terminal text or the text the game gave it and that
being how you solve the puzzle. For now, capture the design inspiration, the techdebt puzzle
item for vi puzzle, and define only a small group of commands in MVP that we'd need to run the
first ~3 rooms or so. I don't think we need to implement `l` just yet. People should type "look",
using natural language to start. We can introduce shortcuts as a puzzle later too (put that in
a separate techdebt for a "shortcuts" puzzle -- I'm sure there is fascinating history and fascinating
related "technology" here to explore).
13. "read journal" I'm not exactly sure what you mean. In the first 3 rooms which we should start
MVP with, all the journal entries should fit on one page, so pagination comes later (a techdebt item).
I could see that "read journal" in the mailbox puzzle just means that the journal opens and the
first puzzle is solved to start the game. But in other rooms, or after that first solve, "read
journal" could open a table-of-contents or other pagination helper for when the game grows. We
don't need to design this now -- MVP should be the first ~3 puzzles (getting the player from setup,
easy learnings, into the house and solve the gold foil puzzle). In the design, the journal is always
shown (once it's first discovered) in the left-most section (at least in MVP). It's not like Zork
where there was no helper UI sections for map and journal. If they want to read the journal, they
can... just read it. Though... later "read journal" could be the implementation of "give authors a
place to put longer details of the technology!" -- yeah, capture that in tech debt too.
14. Drop mean leave the item in the room (add it to the "give" list of the room) but...
is that possible with our current mechanics? I think not. I think don't give them a drop
command right now (drop is not an MVP verb). Drop was for *managing* inventory in zork. Put it
in the engine commands and respond "oops you dropped this, let me put that back for you." And
then flash the item in the inventory 1x. There. simplified. We don't manage inventory in this
game -- that's the first thing to be ignored when playing RPGs for a reason. It's no fun!
15. Restart -- I guess? I'll take your advice but... I mean whatever xyzzy does for Eliza
is probably what this needs. I wonder if Eliza and this game can share some json entries / files
/ engine mechanics? Should probably consider that.
16. I take your entry length proposal for entry chars
17. Easter egg answers -- just find the wikipedia page for those things right now and link that.
I think that might 
