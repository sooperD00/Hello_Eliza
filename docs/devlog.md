Nicole Rowsey 1/23/2026 - ????????
# Hello_Eliza


# FAQ
- I design systems where humans interact with complex things and don't notice the complexity
- I build systems that make people curious
- Nobody needs you to pick one. The people worth working for will see that the person who built intermittent reinforcement into a nav bar is the same person who kept production systems running for a decade — and that's not a contradiction, it's a superpower.

## Notes
- Zork state lives in sessionStorage (clears on tab close)
- Unlocked links persist per session, appear in bottom-left
- The rules JSON is the heart — that's where the personality lives
- Blog essays are just .md files, no database needed

# Tune the Rules (ongoing) 2/4/2026
Edit `wwwroot/data/zork-rules.json` to:
- Add more patterns
- Adjust responses
- Change idle timing
- Add Crawford-specific easter eggs
No recompile needed — it's just JSON.

# View it, Furball
- [ ] cd Hello_Eliza/Hello_Eliza/
- [ ] dotnet run
- [ ] http://localhost:5103

# Vocabulary
- [ ] not *yet* done
- [x] done
- [~] not done *on purpose*; with reason
- [!] error -- could't do this step
	- [ ] a nested investigation and resolution goes here
- [ ] if you expect something
	- expect: write it like this
	- actual [ ]
- [c] an item conceived here but that won't be done here, marked
	"_c_aptured" and a short note about the place it was captured
	in (e.g. housekeeping and the [h-<id>], a sprint number)
- [-] already done / not needed

## "expect" tracking
- [x] if you expect something
	- expect: write it like this
	- actual: [write it like this] # or a summary or a link
- [!] if you expect something
	- expect: write it like this
	- actual: [I wrote it like this]
- [x] if you expect something
	- expect: write it like this
	- actual: [I wrote it like this] but it was OK because I commented that it was
---

# Cave Design 2 10/21/206
Hello_Eliza-20261020: Cave Design -- DESIGN

Pull main up to date
- [ ] git pull  # ~/repos/Hello_Eliza; brings in PR #5, leaves your edits alone
- [ ] git add docs/devlog.md docs/learn/l-20261019.md  # same place
- [ ] git commit -m "devlog: cave design merged, worktree learnings"  # same place
- [ ] git push  # same place

Finish Design
- [ ] answer questions
- [ ] PR #6


---

# Cave Design 10/20/26
Hello_Eliza-20261020: Cave Design -- DESIGN

- [x] git push # FIRST!!!

Worktree for the devlog
- [x] git checkout main  # ~/repos/Hello_Eliza
- [x] git worktree add ../Hello_Eliza-pr5 docs/cave-design  # same place
- [x] edit the devlog in ~/repos/Hello_Eliza, as always

Edit the PR in ~/repos/Hello_Eliza-pr5/docs/cave/
- [x] cd ~/repos/Hello_Eliza-pr5 && git pull  # picks up anything I've pushed
- [-] or open a new tmux window there
- [x] gh pr list
- [x] gh pr diff 5

Edit, git commit, git push  # ~/repos/Hello_Eliza-pr5
- [x] VS Code > File → Add Folder to Workspace > ~/repos/Hello_Eliza-pr5, OK
- [x] edit under Hello_Eliza-pr5/docs/cave/ in the Explorer tree
- [x] make sure you are in ~/repos/Hello_Eliza-pr5
- [x] git add -A && git commit -m "docs(cave): restructure design by component"
- [x] git push
- [x] tell me, then hands off the cave docs until I say I've pushed

Merge and Cleanup
- [x] git pull  # ~/repos/Hello_Eliza-pr5, before you edit again
- [x] gh pr merge 5 --merge  # either folder
- [?] git pull  # ~/repos/Hello_Eliza
- [x] git worktree remove ../Hello_Eliza-pr5  # same place


---

# Mac Setup for C#./NET Development
10/19/2026

On the Mini
- [x] ssh mini
- [x] git clone https://github.com/sooperD00/Hello_Eliza.git ~/repos/Hello_Eliza
- [x] brew install --cask dotnet-sdk
- [x] dotnet --version
	- expect: 10.x
	- actual: [10.0.402]

On Windows (nlr)
- [x] add "LocalForward 5103 localhost:5103" under Host mini  # 
	- C:\Users\Barac0da\.ssh\config
- [x] ssh mini  # Git Bash, fresh session so the forward opens

On the Mini
- [x] cd ~/repos/Hello_Eliza/Hello_Eliza && dotnet run  # ssh mini
	- >> Claude ran it first: every page 200. stopped it after, so 5103 is yours
- [x] open http://localhost:5103  # Windows browser

Claude, on the Mini
- [x] dotnet build  # repo root, finds Hello_Eliza.slnx
	- >> 0 warnings, 0 errors
- [x] dotnet test
	- >> 1/1 passed. it's the template UnitTest1, so the runner works; the site itself isn't tested
- [x] dotnet run, curl every page, stop it
	- >> / /essays /essays/tempest /privacy /cave: 200. /terminal: 404 (PR #1 adds it)
	- >> warnings, both harmless: no https port (http on purpose), DataProtection key unencrypted (first run only, normal on a Mac)
- [x] same for all 4 PRs: gh pr checkout N, build, test, run
	- >> all 4: 0 warnings, 0 errors, pages 200, zork-rules.json valid, zork.js parses
	- >> #1: /terminal and /Ascii/Error work now. #3: the random link renamed itself every reload
	- >> the cloud Claude that wrote them had no .NET; #1 and #3 asked for exactly this check
- [x] commit your section as-is, then mine as a 2nd commit  # git show = just what I added

.NET: what's left (none of it required)
- [~] skip `dotnet dev-certs https --trust`: only the https profile needs it, and your Windows browser wouldn't trust the Mini's cert anyway. http + tunnel is right
- [x] telemetry is on by default (my runs had it off). to opt out for good:
	- echo 'export DOTNET_CLI_TELEMETRY_OPTOUT=1' >> ~/.zshrc
- [x] VS Code (Windows) → Remote-SSH: mini → install "C# Dev Kit"  # on the Mini side
- [!] now and then: brew upgrade --cask dotnet-sdk  # security patches, about monthly
	- [c] let's put some CI in there that does it for us [h-PLACEHOLDER]
		- [x] mkdir -p docs/sprints && touch housekeeping.md
		- [x] I'll use [h-PLACEHOLDER] until I get sprinter-kit in here

PRs: look, then merge
>> 1 → 2 → 4 are stacked (each built on the one before). 3 stands alone
>> heads up: gh pr checkout swaps every file to that branch, this devlog too (the PRs are older than this section). push first, read along on GitHub, tick boxes back on main

Look
- [x] gh pr list
- [x] gh config set pager less  # set up paging in gh like git has
- [x] gh pr diff 4 [--color always | less -R]  # all in 1 diff, no fetch needed

Merge
- [x] git push  # FIRST    !!!!!!!!
- [-] cd ~/repos/Hello_Eliza/Hello_Eliza  # stay here
- [x] gh pr checkout 4  # has 1 and 2 inside
- [x] dotnet run → browser → Ctrl+C
	- what to type is in each PR: gh pr view 1  (and 2, 4)
	- e.g. type 3 things → "do you like my art?" → yes, then keep typing  # #4
	- xyzzy resets
- [x] gh pr checkout 3
- [x] dotnet run → /essays/tempest, reload a few times → Ctrl+C
- [x] gh pr merge 1 --merge --delete-branch  # --merge, not squash: squash breaks the stack
- [x] gh pr merge 2 --merge --delete-branch
- [x] gh pr merge 4 --merge --delete-branch
- [x] gh pr merge 3 --merge --delete-branch
	- >> 1st try: GitHub GraphQL error, nothing merged. Claude reran it from main: merged
- [x] git switch main && git pull  # bring the merges down
	- >> refused at first: 25eb23c had committed obj/, so main's copies ≠ the PR branch's. git restore Hello_Eliza/obj, then fine
	- >> merged main, all 4 together (Claude): 0 warnings, 0 errors, 1/1 tests, every page 200

Later, after the PRs are merged  # sooner would tangle with the open PRs
- [x] stop tracking obj/  # committed from Windows; every build rewrites them = the `M .../obj/...` in git status. don't commit those
	- git rm -r --cached Hello_Eliza/obj Hello_Eliza.Tests/obj && git commit -m "stop tracking obj/"
	- >> acd5b79. build + dotnet run leave git status clean now
- [x] line endings: a few dozen files are CRLF from Windows, this devlog too. recipe in stack-notes/git.md
	- .gitattributes: * text=auto eol=lf
	- git add --renormalize . && git commit -m "normalize line endings"
	- >> f8d606c .gitattributes (binaries marked), 66eb5ee renormalize: 37 files, line endings only (diff --ignore-cr-at-eol is empty)
	- >> copies on disk rewritten to LF too. build, tests, pages all fine after
	- [x] optional: make git blame skip that commit (GitHub's blame view reads the same file)
		- echo 66eb5eee9d8874e1d4575aca5d146d11b637ae1b >> .git-blame-ignore-revs
		- git config blame.ignoreRevsFile .git-blame-ignore-revs
		- >> every line with text goes back to its real commit; blank lines still show 66eb5ee (nothing to match on)
		- >> the config is per clone: rerun it on a new machine
- [x] README "Running Locally" says https://localhost:7102. dotnet run is http://localhost:5103 (https profile: 7079)
	- >> also fixed "Run tests": it said cd Hello_Eliza.Tests from inside Hello_Eliza/Hello_Eliza. now: dotnet test from the repo root

---

# Deep Convo 10/18/2026

Do you like my art?
- [x] PR #1, #2, #3, #4

---

# Mystery 2/6/2026
- [x] make the "essays" and other link fade in
- [x] make them fade in *in their spot* so it will have open spots that suggest there are more
- [x] make a random button for the essays in between <- prev and next ->
- [x] the random button should be named something fun

# Essays cleanup 2/6/2026
- [x] styles
- [x] /essays/{slug} needs a next -> button and a -> random button

# Footer 2/5/2026
- [x] explore the accent colors and more fonts for conversation output
- [x] soften the footer font color?
- [x] remove neuromancer from footer - keep in privacy
- [-] put privacy [ privacy ] simple link in footer
- [x] randomize the footer

# Nav Menu 2/5/2026
- [x] clean up boilerplat nav bar
- [x] fix discovered links section (remove zork-unlock version)
- [x] move bonus appearing secret links to top
- [x] internal links only
- [x] add /cave coming soon
	- [x] you didn't get that brick look you were going for - it's ok, put it here
# Conversation Turns Business Logic Fixes 2/5/2026
- [x] conversation turns are not working as expected - you need to escape //? in regex
- [x] tune the rules - they're kinda stoopid rn

# Terminal Design Cleanup 2/5/2026
- [x] make it so user can just start typing and not have to click the input
- [x] prompt, input, go all on 1 line
- [x] disable text refill suggestions - it kills the mood
- [x] the footer keeps moving up and down depending on the text - keep it lower


# Test 2/4/2026
- [x] dotnet run
1. Go to homepage → type something → ASCII art
2. Type again → ASCII art
3. Type third time → "Do you like my art?" (serif!)
4. Type "yes" → conversation begins
5. Type "blog" → redirects to /essays
6. Check /essays shows your sample essay
7. Click essay → detail view works


# CSS 2/4/2026
- [x] new :root{} with zork box / 70's paperback / literary palatte
- [x] nuke boilerplate _Layout.cshtml.css
- [x] nuke zork.css
- [x] conversation/ASCII output below the new 'terminal'
- [x] Add js timer back in
- [x] Add fade-out before fade-in on output change (helps distracted users notice)


# Write Real Essays 2/4/2026
- [x] Delete `memes-for-moloch-1.md` and replace with your actual first essay
- [x] No separate YAML file, it's front-loaded on the <essay>.md
Frontmatter format:
```yaml
---
title: "Your Title Here"
date: 2025-01-17
description: "Optional subtitle"
published: true
---

Your markdown content...
```

# Wire up Zork and Essays 2/4/2026
- [x] Fix namespaces in Essay.cs and EssayController.cs (Hell0_Web → Hello_Eliza)
- [x] Get what you need out of ZORK_CHECKLIST.md into here and delete the file
- [x] Add routes in Program.cs for /essays `app.MapControllerRoute()`
- [x] Add to _Layout.cshtml:
```html
<link rel="stylesheet" href="~/css/zork.css" />
<script src="~/js/zork.js"></script>
```
- [x] Test the state machine — type three times, watch it turn


# Init 1/23/2026

Repo Root
- [x] ```bash
mkdir Hello_Eliza
cd Hello_Eliza
git clone path/to/Hell0_Web.git
```

New Project (new VS version, get all the updates, new build)
- [x] ```bash
dotnet new mvc -n Hello_Eliza
dotnet new xunit -n Hello_Eliza.Tests
dotnet new sln
dotnet sln add Hello_Eliza/Hello_Eliza.csproj
dotnet sln add Hello_Eliza.Tests/Hello_Eliza.Tests.csproj
```

Add Packages (use nuget)
- [x] ```bash
cd Hello_Eliza  (~/source/repos/Hello_Eliza/Hello_Eliza)
dotnet add package Hell0_TDD.Core
dotnet add package Markdig
dotnet add package YamlDotNet
```

Copy over from Hell0_Web
- [x] ```
Controllers/*   # AsciiController.cs
Models/* 	# AsciiInputModel.cs, ErrorViewModel.cs, MaxLengthAttribute.cs
Views/Ascii/*	# Input.cshtml, Privacy.cshtml
wwwroot/css/*	# site.css
```
- [x] diff Hell0_Web/Program.css Hello_Eliza/Program.css
keep new template .NET 9 `MapStaticAssets()` pattern
update `pattern: "{controller=Ascii}/{action=Input}/{id?}")` to use your home page
- [x] commit

Run it, furball
- [x] ```bash
cd Hello_Eliza/Hello_Eliza
dotnet run
``` >>it works!!!

Fix the namespaces
>>Find (looks good!)
- [x] grep -r "Hell0_Web" --include="*.cs" --include="*.cshtml"
Barac0da@DESKTOP-BJ2JKDO MINGW64 ~/source/repos/Hello_Eliza/Hello_Eliza (main)
$ grep -r "Hell0_Web" --include="*.cs" --include="*.cshtml"
Controllers/AsciiController.cs:﻿using Hell0_Web.Models;
Controllers/AsciiController.cs:namespace Hell0_Web.Controllers
Models/AsciiInputModel.cs:namespace Hell0_Web.Models
Models/ErrorViewModel.cs:namespace Hell0_Web.Models
Models/MaxLengthAttribute.cs:namespace Hell0_Web.Models
Views/Ascii/Input.cshtml:@model Hell0_Web.Models.AsciiInputModel
Views/Ascii/Input.cshtml:    <h2>Hell0_Web!!!</h2>
Views/Shared/_Layout.cshtml:    <title>@ViewData["Title"] - Hell0_Web</title>
Views/Shared/_Layout.cshtml:    <link rel="stylesheet" href="~/Hell0_Web.styles.css" asp-append-version="true" />
Views/Shared/_Layout.cshtml:                <a class="navbar-brand" asp-area="" asp-controller="Ascii" asp-action="Input">Hell0_Web</a>
Views/Shared/_Layout.cshtml:        © 2025 Hell0_Web | No user data harvested, no ICE deployed, no Turing cops called |
Views/Shared/_Layout.cshtml:        <a href="https://github.com/sooperD00/Hell0_Web" style="color: #00ffff; text-decoration: none;">[ View Source ]</a>
Views/_ViewImports.cshtml:﻿@using Hell0_Web
Views/_ViewImports.cshtml:@using Hell0_Web.Models
>>Replace
- [x] find . -type f \( -name "*.cs" -o -name "*.cshtml" \) -exec sed -i 's/Hell0_Web/Hello_Eliza/g' {} +
>>Check (blank - good!)
- [x] grep -r "Hell0_Web" --include="*.cs" --include="*.cshtml"
>>Check other file names just in case (blank - good!)
- [x] grep -r "Hell0_Web" --include="*.csproj" --include="*.json" --include="*.css" --include="*.js" --include="*.md" --include="*.sln"
- [x] dotnet build
>>it works

Write some damn good copy
- [x] no exclamation points
- [x] zork opener, with gibson/nicole flavor sprinkles
- [x] drop text-muted and small
- [x] some .lead in my css
- [x] my corner of the internet
- [x] dotnet run
>>it's nice

Scaffold Zork + Blog for tomorrow
- [x] ```bash
# Models
mv Essay.cs Hello_Eliza/Models/

# Controllers
mv EssayController.cs Hello_Eliza/Controllers/

# Views - create Essay folder first
mkdir Hello_Eliza/Views/Essay
mv Index.cshtml Hello_Eliza/Views/Essay/
mv Detail.cshtml Hello_Eliza/Views/Essay/

# Content - essays live here
mkdir -p Hello_Eliza/Content/Essays
mv memes-for-moloch-1.md Hello_Eliza/Content/Essays/

# wwwroot - static files
mv zork.css Hello_Eliza/wwwroot/css/
mv zork.js Hello_Eliza/wwwroot/js/
mkdir Hello_Eliza/wwwroot/data
mv zork-rules.json Hello_Eliza/wwwroot/data/

# Root level docs
# ZORK_CHECKLIST.md stays at repo root (or delete if you prefer)
# screenshot_hell0_web.png - keep or delete, your call
```
- [x] commit

