# Cave play-through, round 2

Claude played a strict engine that read only [house.json](house.json), [verbs.json](verbs.json), and
the docs. The players were Crawford, who'd heard of Zork but never played it, and
Oscar, 6, who tried to open the box in the jar room. Both typed through Nicole, and nobody told them the command
words. Nicole fixed three bugs in the JSON mid-round, and the
commands were replayed on the fixed files.

## Transcript

```
West of House
You are standing in a field. You see a boarded up house, a mailbox, and a clear sky.

> Look at the mailbox. What do I see
[mailbox look text]

> Why am I here
[no_match] To get along with God, consider the consequences of your behavior

> Look in the mail box
[mailbox look text, again: "look" + "box"]
[FIX: "look in", "look inside", "search" mean open. Replayed.]
[journal appears; 1665 Henry Oldenburg: Philosophical Transactions]
This journal seems magical. ...

> I pick up the fold of paper
[map appears: footprints, mailbox inked, red E]
The paper unfolds in your hands. It's a map.

> Walk around the house
Front of House
You see that the house is made of bricks, ...

> Can I pull off the boards?
[no_match] Better to stay alive, at least while there's a chance to get free.

> Are there windows?
[no_match] My hands are dirty too, what are you afraid of?

> Open the door
[no_match] Pan Galactic Gargle Blasters!
[FIX: the door opens on any attempt. Replayed.]
[FIX: the Silence plays when the door opens.]
The door opens. *There is a two-fold Silence*. ...

> Go through the door
Front Room
There is a small, sturdy, wooden desk. ...
[a blank group box appears in the journal]

> I would open the box
[no_match] Let's go to Las Vegas and pretend we haven't got any relatives.

> Inspect wire
[cord look text]

> inspect jar
[jar look text, with the hum]

> Hold the rod from the jar near the wire
[map inks Bennet's electroscope; 1787 Abraham Bennet: New Experiments on Electricity;
 the box darkens, flashes, and gets its title: atmospheric electricity]
You hear a hum and a crack, and the 2 foils in the jar move apart.
```

## Where I improvised

Each is a rule the engine needs and the spec doesn't have yet.

| # | when | what I did | candidate rule |
|---|------|------------|----------------|
| 1 | the start | began at house (0,0), the first room listed, with no panels showing | a start world and square, in the engine file |
| 2 | "Look at the mailbox. What do I see" | matched engine commands like triggers: a verb and a noun anywhere | engine commands match by the trigger rule |
| 3 | the mailbox solve | showed the panel, then the ink, then the text | a fixed order on a solve |
| 4 | the mailbox solve | held the mailbox drawing until the map appeared | a panel that appears draws everything already earned |
| 5 | the paper | set the step, then showed the map, then the text | inside a trigger: `sets`, then `reveals`, then `say` |
| 6 | the map | the drawing files don't exist yet, so I described them | a missing drawing file falls back to a default |
| 7 | the locked north door | hid its crease along with its letter | a door whose `requires` doesn't hold isn't drawn at all |
| 8 | Front of House's west side | its W stayed red after he came through it, because each square tracks its own side | crossing a door marks both sides when the neighbor has a door there |

## Misses

| input | what happened | status |
|-------|---------------|--------|
| "Look in the mail box" | showed the outside again | fixed: "look in" means open |
| "Can I pull off the boards?", "Open the door" | no match, three turns in a row at the door | fixed: the door opens on any attempt |
| "Walk around the house" | went east, ignoring "around" | fine here only because east was the only way out |
| "go inside" before the door is open | would get an `unmet` line | open; adding "go" to the door's trigger would block walking through it after it opens |
| the hum | lives in the jar's look text, so he only heard it on his last look | open: on arrival, on any look in the room, or as a nudge after a few turns |

## What a newcomer showed

- **Missing words, not grammar.** They typed full sentences: "Can I pull off the boards?", "I would
  open the box", "Hold the rod from the jar near the wire." Whole-word matching handled every one
  whose words were on a list. The failures were all words the author hadn't listed.
- **The quotes don't steer.** 5 of their 13 turns got a `no_match` quote. To someone who knows the
  game they're a wink; to a newcomer they read as the game ignoring you. Crawford had three dead turns
  at the door, and the helper waits for 10 turns or 3 minutes.
- **No reason to be here.** Crawford's second command was "Why am I here," and nothing answers it.
- **Oscar went for the box first.** The jar room names six things: desk, box, dials, ports, stopper,
  rod. Only the jar and the cord answer to looking. After the jar, he wanted to "visit the lady in
  the house." There's no lady, and nothing would have answered.
- **Noun groups held.** The jar was solved with a sentence nobody wrote for it.
- **A group of one completes at once.** The jar's group got its title the moment it was solved.

## Decided after the round

- Beginner help comes mostly from more options, written into the first rooms directly. Common
  questions like "why am I here" get a real answer there, not a quote.

## Lesson for the author

Two clues landed in the wrong place because the round-1 transcript recorded what was typed, not
what the author meant to cause it. The Silence came on "hello?" in round 1, but it belongs to the
door opening. The hum came on "look at the jar," but it was meant as help. A room written from a
transcript needs the author to say what causes what.
