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
      entry, or to link to an expanded learning page of their own.
      (Raised answering the cave's open questions, 2026-10-21.)
- [ ] [t-PLACEHOLDER] A separate room `id`, if renaming rooms starts costing players their saved
      progress. Today a room's ID is its world plus its name.
      (Raised answering the cave's open questions, 2026-10-21.)
- [ ] [t-PLACEHOLDER] A semantic check that every variant of a text marked `is_clue` carries the
      same clue (an LLM could judge it). Today the room builder only asks the author.
      (Raised answering the cave's open questions, 2026-10-21.)
- [ ] [t-PLACEHOLDER] CI that runs the cave's room checks (docs/cave/interface-spec.md, Checks) on
      every world file in the repo.
      (Raised answering the cave's open questions, 2026-10-21.)
