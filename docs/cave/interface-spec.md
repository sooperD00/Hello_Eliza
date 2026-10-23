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
| a room | exactly one square: `"coord": [0, 0]` |

## World file

One world per file. A world loads on its own.

```json
{
  "world": "house",
  "appears": { "requires": { "items": {}, "solved": [] } },
  "rooms": [ ]
}
```

| field | type | required | meaning |
|-------|------|----------|---------|
| `world` | string | yes | the world's name, unique in the game |
| `appears` | `{ "requires": requires }` | no | the world exists only once this holds; omit it to have the world from the start |
| `rooms` | list of rooms | yes | |

## Text

Anywhere a player reads text (`text`, `say`, a `looks` entry), the value can take three shapes:

| shape | example | meaning |
|-------|---------|---------|
| a string | `"The flap drops."` | always this |
| a list | `["The flap drops.", "It creaks open."]` | one picked fresh each time |
| a clue | `{ "options": ["...", "..."], "is_clue": true }` | one picked fresh each time; the room builder checks that every option carries the clue |

## Room

A room has two halves: the place, and its journal.

### The place

| field | type | required | meaning |
|-------|------|----------|---------|
| `id` | string | yes | unique in the game; saved progress records it, so renaming a room is safe; **proposed** format: lowercase words and hyphens, `west-of-house` |
| `name` | string | yes | the room's title, shown in the terminal; unique in its world |
| `coord` | `[x, y]` | yes | its one square |
| `appears` | `{ "requires": requires }` | no | omit it to have the room from the start; a room that takes over a square requires the old room in `solved` |
| `text` | text | yes | what the terminal shows on arrival, and again on `look` |
| `looks` | list of looks | no | what you see when you look at something here |
| `drawing` | path to an `.svg` | no | inked on the map when the room is solved; strokes only; replaces any earlier room's drawing in that square; omit it to get a default drawing |
| `takeable` | takeable | no | what the player can `take` here once the room is solved |
| `takes` | `{ "<item>": count }` | no | leaves the inventory when the room is solved |
| `doors` | edges | no | the four sides; a missing side is blank and closed |
| `portals` | list of portals | no | ways up, down, or elsewhere, drawn inside the square |
| `triggers` | list of triggers | yes | what the room answers to; exactly one has `"solves": true` |
| `journal` | journal block | no | how the room is recorded; omit it and the room writes nothing |

### Looks

```json
"looks": [
  { "nouns": ["mailbox", "box"], "text": "A black mailbox with a red flag. The number on it is 2112, and someone has painted MEMORY on its side in careful white letters." }
]
```

| field | meaning |
|-------|---------|
| `nouns` | the words that name this thing |
| `text` | text: what you see |

The engine answers "look at", "examine", and "x" with these. A thing with no entry gets a no-match
response.

### Takeable

```json
"takeable": { "item": "latex", "count": 3, "max": 3, "drawing": "items/latex.svg" }
```

Nothing goes into the inventory by itself. Once the room is solved, `take latex` (or a dictionary
synonym) moves the items in, once.

| field | type | meaning |
|-------|------|---------|
| `item` | string | the item's name; the room that offers it owns the name |
| `count` | number | how many one take gets; default 1 |
| `max` | number | the most a player can hold; extra is dropped; **proposed** default 1 |
| `drawing` | path to an `.svg` | its picture in the inventory strip; colored and solid, unlike map drawings |

## Requires

The same shape everywhere: worlds, rooms, edges, portals, and triggers. Every field is optional,
and every listed thing must hold.

```json
{ "items": { "latex": 2 }, "solved": ["west-of-house", "rubber-tree"], "steps": ["charged"] }
```

| field | holds when |
|-------|------------|
| `items` | the inventory has at least that many of each; **proposed**: a plain list like `["latex"]` means one of each |
| `solved` | each room, by `id`, has been solved, in any world |
| `steps` | each step was set earlier **in this same room** (by a trigger's `sets`) |

## Edges

```json
"doors": {
  "N": { "kind": "door" },
  "E": { "kind": "wall" },
  "S": { "kind": "door", "requires": { "items": { "lantern": 1 } }, "to": { "world": "woods", "coord": [0, 0] } },
  "W": { "kind": "boundary" }
}
```

| field | type | meaning |
|-------|------|---------|
| key | `N`, `E`, `S`, `W` | the side of this room's square |
| `kind` | `door`, `wall`, `boundary`; more later (`window`) | what the edge is; only `door` can be crossed |
| `requires` | requires | needed to cross; omit it to require nothing |
| `to` | `{ "world", "coord" }` | only on a world's edge; any other door leads to the next square over |

- Each room owns all four sides. Crossing uses the side of the room you're leaving, so two rooms
  that disagree make a one-way door.
- A missing side is blank on the map and can't be crossed.

## Portals

```json
"portals": [
  { "to": { "world": "upstairs", "coord": [0, 0] }, "color": "blue", "requires": { } }
]
```

| field | meaning |
|-------|---------|
| `to` | the world and square it leads to |
| `color` | the outline color on the map, and a word players can use for it ("the blue square") |
| `requires` | needed to use it; omit it to require nothing |

## Trigger

```json
{
  "verbs": ["open"],
  "nouns": ["mailbox", "box", "partition"],
  "phrases": [],
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
| `phrases` | list of strings | |
| `regex` | list of patterns | |
| `requires` | requires | the trigger fires only when this holds |
| `sets` | list of step names | remembered in this room only |
| `say` | text | shown in the terminal when it fires |
| `solves` | bool | firing this solves the room |

**When it fires**: see [Matching](#matching), next. The homepage uses the same rules.

## Matching

One matcher for the cave and the homepage. It takes what the player typed and a list of rules, and
says which rule fires. What a rule does when it fires stays with its caller: a trigger's `say` and
`sets`, a homepage rule's `action` or `reply`. The homepage's side is
[docs/eliza/interface-spec.md](../eliza/interface-spec.md).

**Proposed** file: `Hello_Eliza/wwwroot/js/matcher.js`, loaded by both pages and tested with
`node --test`.

### Reading the input

| matched against | the input is |
|-----------------|--------------|
| `verbs`, `nouns`, `phrases` | lowercased, punctuation dropped, spaces collapsed |
| `regex` | lowercased, otherwise as typed. Punctuation stays, so the homepage's `\?$` still works |

A synonym of more than one word ("pick up") matches those words in a row.

### When a rule matches

| the rule has | it matches when the input has |
|--------------|-------------------------------|
| `verbs` and `nouns` | one of the verbs (or a dictionary synonym) **and** one of the nouns, as whole words |
| `verbs` only (**proposed**) | one of the verbs (or a synonym) as a whole word |
| `nouns` only | one of the nouns as a whole word |
| `nouns` as a list of lists (**proposed**) | one word from **each** list, plus a verb if the rule has verbs |
| `phrases` | exactly one of the phrases, as the whole input |
| `regex` | a match for any pattern, anywhere in the input |

A rule matches on any of its lists. A homepage rule is a rule with one `regex`: its `match`.

### Which rule fires

1. Rules are checked in the order the caller lists them.
2. The first rule that matches **and** whose condition holds fires. A trigger's condition is its
   `requires`; a homepage rule has none. (**Proposed**, round-1.md: the old "first listed wins" let
   a trigger with unmet `requires` block the triggers after it.)
3. When rules matched but none held, the matcher says so, and the cave answers with `unmet`.
4. When nothing matched, the caller decides. The cave answers with `no_match`; the homepage flips
   its coin between a fallback remark and ASCII art.

### What it returns (proposed)

| result | when |
|--------|------|
| `{ rule, captures }` | a rule fired. `captures` are its regex groups: `$1` on the homepage, `world` and `color` for portals |
| `{ unmet: true }` | rules matched, and none held |
| `null` | nothing matched |

### Before and around it, in the cave (proposed)

- The cave replaces "it" with the last noun the player named, before matching (round-1.md).
- The cave matches in this order: easter eggs, then the room's triggers, then engine commands, then
  `no_match` (round-1.md). Engine commands match by the same rules (round-2.md).

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
| `group` | string | the group the room is recorded in; said once, for every entry; omit it and the entry sits loose between boxes |
| `entries` | list of entries | the possible records of this room; one is picked at random when the room is solved, then kept |
| `links` | list of URLs | each click on the room's journal entry opens one at random in a new tab |

### Entry

| field | type | meaning |
|-------|------|---------|
| `year` | number | negative for BCE; lines in a group box sort by it |
| `who` | string | |
| `what` | string | the experiment, paper, or invention |
| `summary` | string | |

All optional. An entry with none of them writes nothing.

Length rule, so each entry fits its one line:

| part | limit | shown |
|------|-------|-------|
| `year`, `who`, `what` | `who` ≤ 30 and `what` ≤ 40 characters | the line itself: `1839 Charles Goodyear: vulcanization` |
| `summary` | ≤ 140 characters | on hover over the line |

## Verb dictionary

One file for the whole game. The keys are the verbs rooms use and the helper shows; the values are
the synonyms players can also type. It starts with what the first rooms need and grows with the
game.

```json
{
  "open":    ["lift", "unlatch", "pry"],
  "take":    ["get", "grab", "pick up"],
  "read":    [],
  "touch":   ["tap", "poke", "feel"],
  "measure": ["ruler"],
  "push":    ["press", "shove"],
  "pull":    ["yank", "tug"]
}
```

(A starting guess; the play-through settles it.)

## Engine

Game-wide, written once. **Proposed** file: `engine.json`.

### Commands

Plain language first. Shortcuts (`n`, `l`, `i`), Unix commands (`ls`, `cd`, `pwd`) and vi commands
come later, each taught by a puzzle (tech debt). The minimum set gets settled in the play-through;
these are the candidates.

| command | also | does |
|---------|------|------|
| `go north`, `go south`, `go east`, `go west` | `north`, `walk north` | crosses that side's door |
| `look` | | shows the room's `text` again |
| `look at <thing>` | `examine <thing>` | shows that thing's `looks` text |
| `take <item>` | dictionary synonyms | moves a solved room's `takeable` into the inventory |
| `inventory` | | lists what you carry |
| `read journal` | | in West of House, opens the journal; elsewhere, the journal is already open |
| `help` | | lists these commands and the dictionary's verbs |
| `drop <item>` | | answers with the `drop` response, flashes the item once in the inventory strip, and keeps it |
| `restart` | `reset` | *poof*: says so, forgets all progress, and reloads, like the homepage |

### Portal phrases

Any of these uses a portal. With several portals in one square, a color ("the blue square") or a
world name picks one.

```json
"portal": {
  "phrases": [
    "I use the portal", "What is this blue square?", "Let's gooooooo!", "Allons-y!",
    "Second star to the right and straight on 'til morning", "To die will be an awfully great adventure",
    "Punch it, Chewie!", "boldly go", "Let us go on and take the adventures that shall fall to us",
    "mankind cannot stay in a cradle forever", "I'm going on an adventure!"
  ],
  "verbs": ["use", "enter", "take"],
  "nouns": ["portal", "square"],
  "regex": [
    "how do i get to (?<world>.+)", "^go to (?<world>.+)", "\\b(?<color>\\w+) square\\b",
    "let'?s go+!*", "\\ballons-?y\\b", "second star to the right", "\\bpunch it\\b",
    "\\bboldly go\\b", "going on an adventure"
  ]
}
```

### Responses

One is picked at random each time.

```json
"responses": {
  "unmet": [
    "You must know that a person’s ability to discern the truth is directly proportional to his knowledge (or what's in his pockets)",
    "Put your right hand in the box (the inventory box)",
    "Should philosophy guide experiments, or should experiments guide philosophy?",
    "If only I had my sonic screwdriver on me",
    "If only someone had already invented the flux capacitor...",
    "There is an art, it says, or rather, a knack to flying",
    "Get to the choppa",
    "Was there anything more exciting in life than seeking answers?"
  ],
  "no_match": [
    "Pan Galactic Gargle Blasters!",
    "My hands are dirty too, what are you afraid of?",
    "You dead awhile there, mon.",
    "Probably got him on ice. Thaw when needed.",
    "Better to stay alive, at least while there's a chance to get free.",
    "Yet in a few years an illiterate runaway named Harriet Tubman would make nineteen trips into this country and lead three hundred fugitives to freedom.",
    "As a kind of castaway myself, I was happy to escape into the fictional world of someone else’s trouble.",
    "we're going to have to play the roles you gave us.",
    "Let's go to Las Vegas and pretend we haven’t got any relatives.",
    "To get along with God, consider the consequences of your behavior",
    "I can only dance in my chains.",
    "In the face of madness, rationality was powerless",
    "I have a bad feeling about this"
  ],
  "drop": "Oops, you dropped this. Let me put that back for you."
}
```

### Easter eggs

Triggers in the trigger format, checked before the room's own. Each one opens the page about it in a
new tab.

```json
"easter_eggs": [
  { "phrases": ["xyzzy"], "opens": "https://en.wikipedia.org/wiki/Xyzzy_(computing)" },
  { "phrases": ["plugh"], "opens": "https://en.wikipedia.org/wiki/Colossal_Cave_Adventure" },
  { "phrases": ["hello sailor"], "opens": "https://foldoc.org/hello,+sailor!" },
  { "phrases": ["zork"], "opens": "https://en.wikipedia.org/wiki/Zork" },
  { "regex": ["warren robinett", "\\brobinett\\b"], "opens": "https://en.wikipedia.org/wiki/Warren_Robinett" }
]
```

| field | meaning |
|-------|---------|
| `opens` | a URL opened in a new tab when the egg fires |

("hello sailor" has no Wikipedia page; the link is its Jargon File entry.)

## Settings

One small file, so the numbers are easy to find and change. **Proposed** file: `settings.json`.

```json
{
  "helper_after_turns": 10,
  "helper_after_minutes": 3
}
```

| field | meaning |
|-------|---------|
| `helper_after_turns` | inputs in one unsolved room before the game shows the dictionary's verbs |
| `helper_after_minutes` | minutes in one unsolved room before the same |

## Checks

Run when a world loads, in the room builder, and later in CI.

| check | if it fails |
|-------|-------------|
| world names are unique | refuse to load the second one |
| room `id`s are unique in the game | refuse to load the room |
| room names are unique within a world | refuse to load the room |
| one room per square, unless a later room `appears` after the earlier one is solved | refuse to load the later room |
| every `solved` names a room `id` that exists | warn |
| every required or taken item is given by some room | warn |
| rooms that give the same item agree on its `max` and `drawing` | warn |
| `count` ≤ `max` | warn |
| exactly one trigger per room has `"solves": true` | refuse to load the room |
| trigger verbs are in the dictionary | warn |
| saved progress names room `id`s that no longer exist | warn |

# Saved

## Progress

Saved in the browser (`localStorage`), kept across visits. **Proposed** key: `caveProgress`.

| field | holds |
|-------|-------|
| `at` | `{ "world", "coord" }` |
| `visited` | squares visited, per world |
| `solved` | room IDs |
| `inventory` | `{ "<item>": count }` |
| `steps` | steps set, per room |
| `journalPicks` | which entry each solved room got |
| `crossed` | doors crossed, per room and side, for the compass letters |

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
    { "id": "rubber-tree", "world": "woods",    "years": [-1600] },
    { "id": "furnace",     "world": "workshop", "years": [1839] },
    { "id": "stamp-press", "world": "workshop", "years": [1900] }
  ]
}
```

(Years here are placeholders. `years` lists the year of each possible entry. A room with several
sits at its earliest year until it's solved, then at the year of the entry it got.)

## Journal

1. **Entering** a room whose group the player hasn't seen draws a new, blank group box under or
   next to the previous one, one line per room in the group, ordered by `year`. The lines stay
   blank.
2. **Solving** a room animates its entry onto its reserved line. An ungrouped entry is written
   loose between the boxes.
3. **Completing** a group redraws its box in a darker shade, flashes it, and writes the group's
   name at the top.
4. **Clicking** an entry opens one of the room's `links` at random in a new tab, every time.

## Map

| what | drawn as |
|------|----------|
| where the player is | footprints in the center of the square |
| a square's edges | drawn only once the player has visited it |
| `door` | a faint sepia broken line, like a fold crease |
| `wall` | a solid line |
| `boundary` | a double line |
| a missing side | nothing: white space |
| a door's direction | a small compass letter (N, E, S, W) at that side: red until the player has crossed it, then black |
| a portal | a colored square outline nested inside the square |
| a one-way door | each room draws its side just inside its own square, so the two sides differ |
| a solved room | its `drawing`, inked stroke by stroke |

Clicking an inked square scrolls the journal to that room's entry.

**Line drawing.** Plain CSS, no library. Each stroked shape gets `pathLength="1"`, which lets CSS
animate `stroke-dashoffset` from 1 to 0 without measuring anything. Fills don't animate, so
drawings must be line art with strokes and no fill; hatching and cross-hatching do the shading. A
library like Vivus is tech debt, for when a drawing needs its strokes timed one after another like a
pen.

**Default drawings.** A room with no `drawing` gets one from the default folder. **Proposed**: picked
by the room's `id`, so it's the same drawing every time, for every player.

## Reveal sequence

On a solve:

1. The map draws the room's `drawing`.
2. The journal handwrites the room's entry onto its line.
3. If that completes the group, the group box darkens, flashes, and gets its name.

## Inventory strip

A strip across the top of the journal and map. Each item shows its `drawing`, its name underneath,
and its count when it's more than one.

# On screen

```
+-------------------------+
| inventory               |
+------------+------------+------------+------------------+
| journal    | map        | terminal   | room builder     |
+------------+------------+------------+------------------+
```

Desktop only.

## Room builder

| when | shows |
|------|-------|
| always | the verb dictionary, as suggestions |
| above every text box | in small gray text: "Is this a clue? Remember: every variant has to carry the clues." |
| on submit, for a field with `"is_clue": true` and more than one option | "You made multiple options in this field and it's marked clue. Do they all give the same clue, no matter which variation the player gets?" Yes or no; the author's answer stands |
| on submit | the checks above |

# Server

**Proposed** locations and routes:

| thing | where |
|-------|-------|
| world files | `Hello_Eliza/Content/Cave/worlds/<world>.json` |
| verb dictionary | `Hello_Eliza/Content/Cave/verbs.json` |
| engine | `Hello_Eliza/Content/Cave/engine.json` |
| settings | `Hello_Eliza/Content/Cave/settings.json` |
| default drawings | `Hello_Eliza/wwwroot/cave/drawings/default/*.svg` |
| one world | `GET /api/cave/worlds/{world}` |
| the dictionary, engine, and settings | `GET /api/cave/game` |
| the group index | `GET /api/cave/groups` |

# Example: the first room

```json
{
  "world": "house",
  "rooms": [
    {
      "id": "west-of-house",
      "name": "West of House",
      "coord": [0, 0],
      "text": "You are standing in an open field west of a white house, with a boarded front door. There is a small mailbox here.",
      "looks": [
        { "nouns": ["mailbox", "box"], "text": "A black mailbox with a red flag. The number on it is 2112, and someone has painted MEMORY on its side in careful white letters." }
      ],
      "drawing": "rooms/west-of-house.svg",
      "doors": { "E": { "kind": "door" } },
      "triggers": [
        { "verbs": ["open"], "nouns": ["mailbox", "box"], "sets": ["opened"], "say": "<what they find>" },
        { "verbs": ["read"], "nouns": ["journal"], "requires": { "steps": ["opened"] }, "say": "<...>", "solves": true }
      ],
      "journal": {
        "entries": [
          { "year": 1852, "who": "Anthony Trollope", "what": "the letter-receiving pillar", "summary": "<...>" },
          { "year": 1915, "who": "Roy Joroleman", "what": "the tunnel mailbox with a red flag", "summary": "<...>" },
          { "year": 1977, "who": "MIT's Dynamic Modeling Group", "what": "Zork", "summary": "<...>" }
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

(Where Front of House and the jar room sit, and what's in them, gets settled in the play-through.)
