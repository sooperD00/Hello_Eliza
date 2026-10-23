# Eliza: interface spec

The formats behind the homepage conversation. This file is new and mostly a TODO; the cave is a
separate project, with its own folder at [docs/cave/](../cave/).

## Matching

The homepage and the cave share one matcher. Its contract lives in the cave's spec:
[Matching](../cave/interface-spec.md#matching). A homepage rule is a matcher rule with one `regex`,
its `match`, and nothing else the matcher reads.

## TODO

- [ ] Write up zork-rules.json here. Today its format (`turn_message`, `idle`, `nav_slots`, `paths`
      and their steps, `rules` and their fields) is described only in the comment at the top of
      `Hello_Eliza/wwwroot/js/zork.js`.
- [ ] Start a design.md for Eliza beside this file. There's no design doc yet: `docs/design/` is a
      folder of images and notes (the Weizenbaum summary, the CSS styles, the writing-technology
      continuum), not a design doc.
