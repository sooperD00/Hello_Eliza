# Cave play-through, round 1

Nicole played the game; Claude played a newcomer. Three squares: West of House, Front of House, and
the gold leaf jar. What happened is now [house.json](house.json) and [verbs.json](verbs.json), in the
[interface-spec](../interface-spec.md) format plus a few new fields, flagged below.

Round 2 swaps: Claude is a strict engine that reads only those two files and the docs, and Nicole
plays.

## Transcript

(Game text is Nicole's first draft, with typos fixed. Stage directions in brackets are paraphrased.
So are two of my commands, the first look and the pickup; their exact wording fell out of my
context.)

```
West of House
You are standing in a field. You see a boarded up house, a mailbox, and a clear sky.

> look at the mailbox
You see a black mailbox with a little red flag, a rusty mailbox door, and the mailbox is
labeled in white paint: 'memory', with presumably the house number, '2112'.

> open it
[The journal appears in its column. First entry:
 1665: Henry Oldenburg: Philosophical Transactions of the Royal Society.]
This journal seems magical. You don't know how the mechanism works. As you lift the journal
to peer more closely at it, a slip of lumpy folded paper falls out onto the ground.

> pick up the paper
[The map unfolds. West of House is inked: a mailbox. Only E shows.]
[Decided here: the journal and the map are not inventory.]

> walk to the house
Front of House
You see that the house is made of bricks, some of which are crumbling or missing. The door
is boarded up, but not well.

> knock
The door opens.
[N appears on the map.]

> hello?
*There is a two-fold Silence*. You hear the rush of the sea and a wave crashing on the
shore. But inside you see only a normal, though dimly-lit, room.
[Link for later: https://poets.org/poem/silence-4]

> go inside
There is a small, sturdy, wooden desk. On top of it is a metal box, with a row of dials and
3 ports. One of the ports holds the jack of one side of an electrical cord. A glass jar sits
beside it, sealed with a thick rubber stopper, and with a brass rod sticking straight up
through the stopper.

> look at the jar
Inside the jar are two impossibly thin ribbons of gold foil hanging side by side.
You hear a hum from the metal box, and the electrical cord shakes.

> follow the cord
One side of the cord is connected to the metal box with the knobs. The other end exposes a
metal tip.

> touch the metal tip to the brass rod
You hear a hum and a crack, and the 2 foils in the jar move apart.
[The map inks a line drawing of Bennet's gold leaf electroscope. The journal writes:
 (1787) Abraham Bennet: New Experiments on Electricity.
 Link: https://en.wikipedia.org/wiki/Abraham_Bennet#/media/File:Bennet-1.jpg
 Long text: the book's full title.]
[The measurement waits for later: no long chains in the MVP.]

> look at the map
[End of round 1.]
```

## Where the spec didn't fit

Each row is a place the format couldn't hold what happened. The last column is what house.json does
about it; every one of those is a proposal.

| # | what happened | what the spec lacks | proposal |
|---|---------------|---------------------|----------|
| 1 | `open it` | pronouns | engine rule: `it` means the last noun the player named |
| 2 | opening the mailbox showed the journal; taking the paper showed the map | a way to reveal a panel | trigger field `reveals`: `["journal"]`, `["map"]` |
| 3 | the mailbox solved the room, not `read journal` | `read journal` now has no job | `read journal` prints the latest entry's `long_text` (question 6) |
| 4 | `pick up the paper` after the solve | nothing; triggers keep firing after a solve, which works | none |
| 5 | `walk to the house`, `go inside` | moving by a landmark instead of a compass word | edge field `nouns`; `go` (or a synonym) plus an edge's noun crosses that edge |
| 6 | `knock`, with no noun | a rule for a trigger with verbs only | it fires on one of the verbs as a whole word |
| 7 | `follow the cord` | look-at only knows "look at", "examine", "x" | a `look` entry in the dictionary; `follow` and `trace` are synonyms |
| 8 | `touch the metal tip to the brass rod` | two nouns | `nouns` can be a list of lists: one word from each list |
| 9 | Bennet's full title | a field for long text | entry field `long_text`, exempt from the length rule |
| 10 | the Poe link, in a room with no entry | links open only from an entry | kept in the room's `links`; unreachable until Front of House gets an entry |
| 11 | E showed with the map; N showed on the knock | when a compass letter appears | a door's letter shows once its `requires` holds |
| 12 | `take` the paper, which isn't an item | which goes first, a room's trigger or an engine command | easter eggs, then room triggers, then engine commands, then `no_match` |
| 13 | "Philosophical Transactions of the Royal Society" is 46 characters | `what` caps at 40 | shortened to "Philosophical Transactions" |
| 14 | `look at the map` | the panels aren't nouns in any room | engine answers for `journal`, `map`, and `inventory` (text not written yet) |

Two more the JSON exposed:

- **The unmet rule blocks the first-listed rule.** The spec says "first listed wins," and that words
  matching with `requires` failing gets `unmet`. Together, a trigger listed first with unmet
  `requires` stops every trigger after it, even one that would fire. Proposal: fire the first
  trigger whose words match and whose `requires` holds; answer `unmet` only if none hold.
- **A solve can fire twice.** `open mailbox` again would re-solve. Proposal: after the solve, the
  trigger repeats its `say` and changes nothing.

## Decided in play

- West of House is (0,0), Front of House is (1,0), and the jar is at (1,1), north of the front door.
- The journal and the map are panels, not inventory.
- West of House solves on opening the mailbox. Its map drawing is a mailbox. (design.md said the
  journal itself.)
- Front of House opens on a knock, and N appears.
- The jar solves on touching the cord's tip to the brass rod. The ruler and the measurement wait.

## In house.json but not played

- The crow, from design.md: `touch board` gets "A crow flies overhead."
- The jar is takeable once solved, from design.md.
- My draft text for the paper: "The paper unfolds in your hands. It's a map."
- My draft summaries for both entries, under 140 characters.
- The links for West of House: I added Philosophical Transactions and kept the three mailbox links.

## Questions

1. Should the E door wait for the map? house.json says yes, so nobody leaves before the game starts.
2. Should `open door` (or pulling the boards) also open Front of House? house.json takes only a
   knock.
   **Answered in round 2:** the door opens easily at any kind of attempt, and the Silence is what
   you hear when it opens.
3. The jar's square needs a name. house.json says "Front Room."
4. Bennet's group: house.json says "atmospheric electricity," the subject of his book's title, and
   where the jar goes when it's carried up a tree or a balloon.
5. West of House's entry: Oldenburg only, or Oldenburg plus the postal-history shelf as alternates?
6. Should `read journal` print the latest entry's `long_text`?
7. Bennet's year: he first described the gold leaf electroscope in *Philosophical Transactions* in
   1787; *New Experiments on Electricity* is his 1789 book. Which goes on the line? (Either way,
   the first entry's journal published the second entry's jar.)
8. The compass, still open from play: in the mailbox, at the front door, or not in the MVP?
