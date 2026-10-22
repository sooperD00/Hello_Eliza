# Tech Debt

Deferred work, probably for a while. Anything that turns out to be needed soon belongs in a sprint
or in Housekeeping, not here.

IDs are identity, not order: nothing here is renumbered, and the count is what matters. The
placeholders get real IDs when sprinter-kit comes in.

- [ ] [t-PLACEHOLDER] Feedback to a room's author: a way for a player to tell the author something
      about their room. There's no persistence layer to hold it. Even "email the room's author"
      would do as a first version, but an address on a public page invites spam, which is why it
      waits.
      (Raised answering the cave's open questions, 2026-10-21.)
- [ ] [t-PLACEHOLDER] A line-drawing library such as Vivus, if the plain CSS stroke trick isn't
      enough: for a drawing whose strokes should be timed one after another, like a pen.
      (Raised answering the cave's open questions, 2026-10-21.)
- [ ] [t-PLACEHOLDER] Longer journal text: a way for authors to write more than one line per
      entry, or to link to an expanded learning page of their own. "read journal" could be where
      a player reaches it.
      (Raised answering the cave's open questions, 2026-10-21; "read journal" added 2026-10-22.)
- [ ] [t-PLACEHOLDER] A semantic check that every variant of a text marked `is_clue` carries the
      same clue (an LLM could judge it). Today the room builder only asks the author.
      (Raised answering the cave's open questions, 2026-10-21.)
- [ ] [t-PLACEHOLDER] CI that runs the cave's room checks (docs/cave/interface-spec.md, Checks) on
      every world file in the repo.
      (Raised answering the cave's open questions, 2026-10-21.)
- [ ] [t-PLACEHOLDER] Journal pages: pagination, and a table of contents (maybe what "read
      journal" opens), once the journal outgrows one page. The first rooms fit on one.
      (Raised answering the cave's open questions, round 2, 2026-10-22.)
- [ ] [t-PLACEHOLDER] A shortcuts puzzle: a room that teaches shortcuts (`n`, `l`, `i`, `ls`, `cd`,
      `pwd`) and unlocks them, with the history behind them as its technology.
      (Raised answering the cave's open questions, round 2, 2026-10-22.)
- [ ] [t-PLACEHOLDER] A vi puzzle: typing `vi` shows vi's commands in gray, and the player learns
      `i` for insert and the rest in a mini-game, maybe by editing the terminal's earlier text to
      solve it. Needs new engine logic.
      (Raised answering the cave's open questions, round 2, 2026-10-22.)
- [ ] [t-PLACEHOLDER] NPCs, and the verbs that come with them: `give` (and `use`, maybe a synonym)
      takes an item out of the inventory. No NPCs yet, so no design yet.
      (Raised answering the cave's open questions, round 2, 2026-10-22.)
