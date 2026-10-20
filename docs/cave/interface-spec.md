# Cave: interface spec

The formats the cave reads and writes. The arguments behind them are in [design.md](design.md),
and this file follows its order: authored, saved, derived. Anything marked **proposed** hasn't been
decided yet; see the open questions at the end of design.md.

# Authored

## Coordinates

| rule | value |
|------|-------|
| shape | `[x, y]`, integers |
| scope | per world; every world has its own (0,0) |
| directions | N is +y, E is +x |
| a room's squares | a list: `[[0, 0]]`, or `[[2, 0], [3, 0]]` for a room that covers two |

## World file

One world per file. A world loads on its own.

```json
{
  "world": "house",
  "appears": { "requires": { "items": [], "solved": [] } },
  "rooms": [ ]
}
```

| field | type | required | meaning |
|-------|------|----------|---------|
| `world` | string | yes | the world's name, unique in the game |
| `appears` | `{ "requires": requires }` | no | the world exists only once this holds; omit it to have the world from the start |
| `rooms` | list of rooms | yes | |

## Room

A room has two halves: the place, and its journal.

### The place

| field | type | required | meaning |
|-------|------|----------|---------|
| `name` | string | yes | the room's title, shown in the terminal; also its ID for now (open question 1) |
| `coords` | list of `[x, y]` | yes | the square or squares it covers |
| `appears` | `{ "requires": requires }` | no | omit it to have the room from the start; a room that takes over a square requires the old room in `solved` |
| `text` | string | yes | what the terminal shows on arrival |
| `drawing` | path to an `.svg` | no | inked on the map when the room is solved; replaces any earlier room's drawing in that square |
| `gives` | item name | no | goes into the inventory when the room is solved |
| `takes` | list of item names | no | **proposed**: leaves the inventory when the room is solved (open question 2) |
| `doors` | edges | no | the four sides; a missing side is blank and closed |
| `portals` | list of portals | no | ways up, down, or elsewhere, drawn inside the square |
| `triggers` | list of triggers | yes | what the room answers to; exactly one has `"solves": true` |

### The journal

| field | type | required | meaning |
|-------|------|----------|---------|
| `journal` | journal block | no | how the room is recorded; omit it and the room writes nothing |

## Requires

The same shape everywhere: worlds, rooms, edges, portals, and triggers. Every field is optional,
and every listed thing must hold.

```json
{ "items": ["latex"], "solved": ["Front of House"], "steps": ["charged"] }
```

| field | holds when |
|-------|------------|
| `items` | each item is in the inventory |
| `solved` | each named room has been solved, in any world |
| `steps` | each step was set earlier **in this same room** (by a trigger's `sets`) |

## Edges

```json
"doors": {
  "N": { "kind": "door" },
  "E": { "kind": "wall" },
  "S": { "kind": "door", "requires": { "items": ["lantern"] }, "to": { "world": "woods", "coords": [0, 0] } },
  "W": { "kind": "boundary" }
}
```

| field | type | meaning |
|-------|------|---------|
| key | `N`, `E`, `S`, `W` | the side of this room's square |
| `kind` | `door`, `wall`, `boundary`; more later (`window`) | what the edge is; only `door` can be crossed |
| `requires` | requires | needed to cross; omit it to require nothing |
| `to` | `{ "world", "coords" }` | only on a world's edge; any other door leads to the next square over |

- Each room owns all four sides. Crossing uses the side of the room you're leaving, so two rooms
  that disagree make a one-way door.
- A missing side is blank on the map and can't be crossed.

## Portals

```json
"portals": [
  { "to": { "world": "upstairs", "coords": [0, 0] }, "color": "<color>", "requires": { } }
]
```

| field | meaning |
|-------|---------|
| `to` | the world and square it leads to |
| `color` | the outline color on the map |
| `requires` | needed to use it; omit it to require nothing |

## Trigger

```json
{
  "verbs": ["open"],
  "nouns": ["mailbox", "partition", "box"],
  "regex": [],
  "requires": { },
  "sets": [],
  "say": "<what they find>",
  "solves": true
}
```

| field | type | meaning |
|-------|------|---------|
| `verbs` | list of dictionary verbs | |
| `nouns` | list of words | |
| `regex` | list of patterns | |
| `requires` | requires | the trigger fires only when this holds |
| `sets` | list of step names | remembered in this room only |
| `say` | string | shown in the terminal when it fires |
| `solves` | bool | firing this solves the room |

**When it fires.** Matching is case-insensitive and ignores punctuation.

| the trigger has | it fires when the input has |
|-----------------|------------------------------|
| `verbs` and `nouns` | one of the verbs (or a synonym from the dictionary) **and** one of the nouns, as whole words |
| `nouns` only | one of the nouns as a whole word: an exact-word list for passwords and answers |
| `regex` | a match for any pattern, anywhere in the input |

A trigger with both word lists and `regex` fires on either. **Proposed**: when two triggers in a
room could fire, the first one listed wins, the same rule as the homepage.

## Journal block

```json
"journal": {
  "group": "rubber stopper",
  "entries": [
    { "year": 1839, "who": "Charles Goodyear", "what": "vulcanization", "summary": "<...>" }
  ],
  "links": ["https://en.wikipedia.org/wiki/Vulcanization"]
}
```

| field | type | meaning |
|-------|------|---------|
| `group` | string | the group the room is recorded in; said once, for every entry |
| `entries` | list of entries | the possible records of this room; one is picked at random |
| `links` | list of URLs | clicking the room's journal entry opens one at random in a new tab |

### Entry

| field | type | meaning |
|-------|------|---------|
| `year` | number | negative for BCE; slots in a group box sort by it |
| `who` | string | |
| `what` | string | the experiment, paper, or invention |
| `summary` | string | |

All optional. An entry with none of them writes nothing.

## Verb dictionary

One file for the whole game. The keys are the verbs rooms use and the helper shows; the values are
the synonyms players can also type.

```json
{
  "open":  ["lift", "unlatch", "pry"],
  "touch": ["tap", "poke"]
}
```

## Engine responses

Game-wide, written once. The format is undecided (open questions 7–9): no match, unmet
requirements, movement, look, inventory, help.

# Saved

## Progress

Saved in the browser (`localStorage`), kept across visits. **Proposed** key: `caveProgress`.

| field | holds |
|-------|-------|
| `at` | `{ "world", "coords" }` |
| `visited` | squares visited, per world |
| `solved` | room names |
| `inventory` | item names |
| `steps` | steps set, per room |
| `journalPicks` | **proposed**: which entry each solved room got (open question 3) |

## Your own files

| action | how |
|--------|-----|
| Save | downloads `cave.json` to the browser's downloads folder |
| Load | a file picker; Chrome and Edge start it in Downloads |
| Drop | drag a `.json` onto the room builder, in any browser |
| Save again | in Chrome and Edge, overwrites the same file instead of making `cave (2).json` |

A loaded file holds a world in the world-file format. Loaded rooms live only in that browser, and
their groups join only that browser's journal.

# Derived

## Group index

Built by the server from every world file. **Proposed** route: `GET /api/cave/groups`.

```json
{
  "rubber stopper": [
    { "world": "woods",    "room": "rubber tree", "years": [-1600] },
    { "world": "workshop", "room": "furnace",     "years": [1839] },
    { "world": "workshop", "room": "stamp press", "years": [1900] }
  ]
}
```

(Years here are placeholders. `years` lists the year of each possible entry; where a room with
several sits before it's solved depends on open question 3.)

## Journal

1. **Entering** a room whose group the player hasn't seen draws a new, blank group box under or
   next to the previous one, with one slot per room in the group, ordered by `year`.
2. **Solving** a room animates its entry into its reserved slot.
3. **Completing** a group redraws its box in a darker shade, flashes it, and writes the group's
   name at the top.
4. **Clicking** an entry opens one of the room's `links` at random in a new tab.

## Map

| what | drawn as |
|------|----------|
| where the player is | footprints in the center of the square |
| a square's edges | drawn only once the player has visited it |
| `door` | a faint sepia broken line, like a fold crease |
| `wall` | a solid line |
| `boundary` | a double line |
| a missing side | nothing: white space |
| a portal | a colored square outline nested inside the square |
| a one-way door | each room draws its side just inside its own square, so the two sides differ |
| a solved room | its `drawing`, inked stroke by stroke |

Clicking an inked square scrolls the journal to that room's entry.

## Reveal sequence

On a solve:

1. The map draws the room's `drawing`.
2. The journal handwrites the room's entry into its slot.
3. If that completes the group, the group box darkens, flashes, and gets its name.

## Inventory strip

A strip across the top of the journal and map, listing the inventory. Word or drawing: open
question 12.

# On screen

```
+-------------------------+
| inventory               |
+------------+------------+------------+------------------+
| journal    | map        | terminal   | room builder     |
+------------+------------+------------+------------------+
```

Desktop only.

# Server

**Proposed** locations and routes:

| thing | where |
|-------|-------|
| world files | `Hello_Eliza/Content/Cave/worlds/<world>.json` |
| verb dictionary | `Hello_Eliza/Content/Cave/verbs.json` |
| one world | `GET /api/cave/worlds/{world}` |
| the group index | `GET /api/cave/groups` |

# Example: the first room

```json
{
  "world": "house",
  "rooms": [
    {
      "name": "Front of House",
      "coords": [[0, 0]],
      "text": "You are standing in an open namespace west of a white villa, with a boarded front door. There is a small memory partition here.",
      "drawing": "<the journal>.svg",
      "gives": "journal",
      "doors": { "N": { "kind": "door" } },
      "triggers": [
        { "verbs": ["open"], "nouns": ["mailbox", "partition", "box"], "say": "<what they find>", "solves": true }
      ],
      "journal": {
        "entries": [
          { "year": 1852, "who": "Anthony Trollope", "what": "the letter-receiving pillar", "summary": "<...>" },
          { "year": 1915, "who": "Roy Joroleman", "what": "the tunnel mailbox with a red flag", "summary": "<...>" },
          { "year": 1977, "who": "Anderson, Blank, Daniels, and Lebling", "what": "Zork", "summary": "<...>" }
        ],
        "links": [
          "https://en.wikipedia.org/wiki/Pillar_box",
          "https://99percentinvisible.org/article/open-source-icon-rural-americas-classic-metal-mailbox-with-flag-design/",
          "https://if50.substack.com/p/1977-zork"
        ]
      }
    }
  ]
}
```
