# Housekeeping

## CI

- [ ] [h-PLACEHOLDER] let's get some CI in here that checks dates or something in a file log
and runs `brew upgrade --cask dotnet-sdk  # security patches, about monthly` or whatever you
call something like this. Obs it would be local only, but that would be a nice thing to have
and to automate the check of on a commit cadence.
- [ ] [h-PLACEHOLDER] GitHub Actions on push + PR: dotnet build, dotnet test, rules checks (free for public repos)
	- would have built last night's PRs for us (their session had no .NET)
	- it's also the gate Railway waits on before deploying (see Deploy)

## Deploy
- [ ] [h-PLACEHOLDER] I bought hello-eliza.net, .me, and .si; set up the links and deploy
on railway.
	- the 3 domains are parked at Namecheap right now
	- [ ] plan this one first: Railway deploys every push to main (stack-notes/railway.md)
	- [ ] Dockerfile (sdk:10.0 build → aspnet:10.0 run) on $PORT; .dockerignore with **/bin and **/obj
	- [ ] /health endpoint; set Railway's health check and builder by hand
	- [ ] Railway: wait for CI, plus watch paths so devlog commits don't redeploy
	- [ ] all 3 domains on the service (apex = ALIAS record at Namecheap); .me and .si 301 to .net in the app, so https works on all 3
	- [ ] forwarded headers, so the app knows it's https behind Railway's proxy
	- [ ] README Tech Stack says Azure App Service: is anything still running there?

## Deep Convos
- [ ] Make something special for Crawford... researching Dune

## Essay Stylings
- [ ] essay stylings

## Hardening
- [ ] [h-PLACEHOLDER] Connect Hello_Eliza.Tests to the app (project reference) and delete UnitTest1.
- [ ] [h-PLACEHOLDER] Write the route smoke test with WebApplicationFactory: every route and every published essay slug answers 200. Every push.
	- routes: /, /terminal, /cave, /privacy, /faq, /essays, /blogs
- [ ] [h-PLACEHOLDER] Write the internal-link test on the same test server: every `/` link on each rendered page, and every path in zork-rules.json, answers 200. Every push.
- [ ] [h-PLACEHOLDER] Write the content test: every published essay's front matter parses, and zork-rules.json parses. Every push.
	- ParseEssay swallows errors and drops the essay, so today a front-matter typo makes an essay vanish silently
- [ ] [h-PLACEHOLDER] Move the rule matcher out of zork.js into its own file (text + rules in, rule out), load it from the page, and test it with node --test: phrase → which rule fires. Every push.
- [ ] [h-PLACEHOLDER] Write the link reader: one list of every external URL a visitor can reach, each with where it's used.
	- reads: rules[].action (https only), each cave room's journal.links, published .md essays, faq.md, the footer
	- skips: .txt drafts, README, docs/
	- its shape test runs every push: each action is a /path or an https URL, each journal link is https
- [ ] [h-PLACEHOLDER] Add the link-check workflow: lychee over the reader's list. Weekly, a run-now button, and on PRs that touch content (new links only).
	- dead (404, 410, gone domain): one rolling GitHub issue, a `- [ ]` per link naming its rule, room or essay
	- bot-blocked (403, 429, 999, repeat timeouts): same issue, under "check by hand"
	- moved (301 to another page): same issue, under "worth a look"
	- main never turns red
- [ ] [h-PLACEHOLDER] After Railway is live: smoke the live routes on hello-eliza.net, and check that .me and .si 301 to .net.

## Documentation
- [ ] update README.md for the new color scheme

## Teaching
- [ ] add in those cool @zork comments so you can show parts of the text
	- none in the code yet; README's Self-Documenting Code section shows `// >EXAMINE ... <-- EXAMINE`. pick one syntax
	- plan this one first: what gets tagged (JSON can't hold comments), how the crawler runs (a build step that writes JSON for zork.js?), how a visitor asks

## Conversation
- [ ] change redirect to providing a link instead in the "conversation" area
- [ ] Add fade-out before fade-in on output change (helps distracted users notice)
- [ ] you need a better transition for turn enum #3...
- [ ] ASCII output is a little thin/small
- [ ] at least 3 "deep paths"?
- [ ] add a lot/bunch more questions and what happens when user says "yes/no"
- [ ] do something with $input like when you were 12
	- PR #2 put "earlier you said $input" in the fallback (literal, Apple II style). done, or more?

## Glitching
- [x] add a discoverable "terminal" link at the top
- [x] like home but terminal - that gives you a nice open spot for ppl to keep guessing and an unlikely word for it ;)
- [ ] Add a subtle idle animation — the | pipes blink like a cursor every few seconds
- [ ] Make it a zork trigger: typing "source" or "github" opens the repo
- [ ] make a glitch effect on pipe chars and open link spots
- [ ] make "snowcrash" animation/blinking in the other spots
- [ ] Randomize the footer occasionally and subtly in an animation on a timer

Undiscovered slots: invisible but space-reserved 
(▓░░ saved for future ambient glitch system)
Discovery: slow fade-in → 2 glitches (jitter + cyan/magenta) → settle as solid link
No navigation on first discovery — the animation IS the reward. Second time they type it → navigates.
External links still open in new tab as-is

## Pages
- [x] privacy stylings
- [x] FAQ page "question|frequently|why"
- [ ] FAQ content .md
- [ ] home and /terminal tab titles read " - Hello_Eliza": Input.cshtml never sets ViewData["Title"]

## Stack notes
For the next stack-notes review (the grep in the stack-notes README collects these).
- [ ] [h-PLACEHOLDER] stack: git — tracked build output that differs between branches makes git switch refuse; .gitignore doesn't untrack it, git rm -r --cached does
- [ ] [h-PLACEHOLDER] stack: git — git add --renormalize fixes the index but leaves CRLF on disk; rm the files and git restore them
- [ ] [h-PLACEHOLDER] stack: git — blame.ignoreRevsFile can't re-attribute blank lines; they stay on the ignored commit
- [ ] [h-PLACEHOLDER] stack: gh — gh pr merge can fail with "GraphQL: Something went wrong" and merge nothing; check gh pr view N --json state, then rerun
- [ ] [h-PLACEHOLDER] stack: gh — no pager unless you set one, so gh pr diff scrolls past; gh config set pager less
- [ ] [h-PLACEHOLDER] stack: jq — several files in one call are one stream: line numbers run on, and a BOM at the start of file 2+ is a parse error
- [ ] [h-PLACEHOLDER] stack: macos — zsh errors on an unquoted glob that matches nothing (grep --include=*.cs); quote it
