# FAQ
> You found it.

---

### What is this?

This is my personal website. I'm 41 years old in 2026. I started programming in 1992 on my dad's IBM beige box, which he maintained himself by reading magazines and provisioning himself a small egghead.com budget taken out of his lunch allowance. 

He had 3 rules: 1. Don't turn off the power switch unless you properly shut down the computer 2. Count to 10 between turning the power switch off, and turning it back on 3. Never `Ctrl+s` — always `File > Save As`. Everyone was pretty religious about rules 1 and 2. But no one followed the 3rd rule. Why did he care about this? Clearly he just wanted to do it the old way he had learned "a long time ago" and not learn the new-better-shortcut like us smart kids. But, when you did press `Ctrl+s`, it did do something weird — faint, gray, italic files like *$tmp_your_file.doc* would show up in the file explorer. A mystery.

I learned to program from one single magazine that my dad brought back from a newspaper shop in the New York City Penn Station train station. It included printed plain text of BASIC programs that I was supposed to painstakingly type into... I'm not sure what program or console or application (my dad set that part up). I picked the shortest program with the fewest ("fewest" is correct here, not "least") special characters, but still I never finished it. It also didn't help that this magazine contained programs in BASIC, and our machine wanted QBASIC.

Somehow, I remembered to count by 10, 20, 30, though I'm not sure why, even to this day. I think it's in case you make a mistake and need to insert numbers in between as your program expands but I'm not sure. I remembered $INPUT, which didn't always work for some reason, and I remember PRINT. Armed with these meagre tools, my creativity was unleashed on my middle school's Apple II machines where my friends and I were allowed to come to "typing" class before it started, sneaking in from lunch early to load this program on as many machines as we could: 

```BASIC
10 PRINT "Hello!"
20 $INPUT
30 PRINT "What is your name?"
40 $INPUT e
50 PRINT "Hello $e, nice to meet you!"
60 $INPUT
70 PRINT "Do you want to play a game?"
80 $INPUT
90 IF YES PRINT "Knock knock"
100 PRINT "Welcome to Cyberspace!!!!"
110 GOTO 100
```

Hello_Eliza is the same. 
 
---

### Why does it work like this?

Most websites hand you a menu and say *here is what we have.* This one makes you ask for it. The navigation is hidden inside the conversation. You discover pages by typing the right words, and the vocabulary you learn *is* the interface.

This is annoying on purpose. Not because I enjoy your frustration (a little), but because the friction is the point. You have to be curious. You have to try things. You have to engage with a system without knowing the rules and figure them out from its responses.

You do this every day with systems that don't tell you they're doing it.

---

### Is this an AI?

No. It's a finite state machine with a regex table. The difference matters.

The conversation engine is a JSON file, a handful of regular expressions, and some state. No neural networks. No embeddings. No magic. Just a lookup table — the same technology ELIZA used to fool therapists in 1966.

An AI (or what gets marketed as one) works by statistical inference over billions of parameters. This works by `if input matches pattern, then respond`. There is no understanding. There is no comprehension. There is a lookup table.

ELIZA was the same, and people poured their hearts out to it. The gap between *"this system understands me"* and *"this system was built so I'd think it understands me"* is the gap this project lives in.

---

### Why should I care about that gap?

Intermittent reinforcement — the same mechanic that drives slot machines — is the reason you check your phone 96 times a day. Random rewards on an unpredictable schedule create compulsive behavior. This site uses intermittent reinforcement openly. (The idle messages. The random response selection. The coin-flip fallback.) So does every social media platform you use, but they don't tell you.

The difference between manipulation and education is consent.

---

### Did you build this with AI?

Extensively. I used Claude as a collaborator for code, design decisions, and the README. I am building a website that critiques hidden systems using a system whose internals I can't fully see. If that's a contradiction, it's one I'm choosing to sit with rather than pretend doesn't exist.

The site runs on a hand-written JSON rules file. Every regex I can explain. Every response I chose. The tool is opaque; the artifact is not. That's the best I can do, and I think it's enough.

---

### Why did you make this?

I got laid off. That's the practical answer.

The real answer is that I've spent my whole career building things for other people's priorities — calibration platforms, yield analysis tools, data pipelines — and the systems I'm proudest of are the ones that kept running for a decade after I left them behind. That's gratifying and also invisible. Nobody sees infrastructure that works.

So I made a thing that is *only* surface. A website that is nothing but interaction and response. Not useful. Not optimized. Not A/B tested. Not trying to retain you or convert you or monetize your attention. Just: you type, something happens, and maybe you want to type again.

I know the internet has trained most people out of the patience this requires. I made it anyway.

---

# What's the aesthetic?

2 more rejections rolled in today. So you might think I should choose dead channel gray, cyan neon, and rain-slick black. But, Hello_Eliza is a system that rewards curiosity and punishes nothing.

I am writing a custom website with intermittent reinforcement baked into a nav bar to process my feelings. I'm hand-building a text adventure to describe how I look at things. There is also a Zork terminal that is decidedly *not* welcoming. Intriguing. A door for sure. I am patient, with a quiet conviction that you can figure it out without being told. I'm also the kid who didn't get invited to the workbench but showed up anyway. I'm going in, with or without you. (Warm cream paper, typewriter fonts, newsprint gray, and rust-colored links.)

---

### What's the cave?

I want to explore zork, building, and the generational transmision of careful engineering. The kind of engineering where every room is placed by hand, every connection is checked by a person who cares, and the system works because a team sat in a room together and thought hard about boundary conditions. It is a kind of work that requires discipline, love, and each other. This is how Infocom built Zork. It is the best gift I received from the old guard at Intel.

---

### What are the essays about?

Whatever I'm thinking about. Interface design and human-in-the-loop systems. Moloch coordination problem. Books and plays I'm writing. The difference between *"I don't understand this"* and *"this was built so I wouldn't."*

I'm a PhD electrical engineer who spent 13 years building systems at Intel. I have opinions about how complex systems interact with human attention, and this is where I decided to put them.

---

### Can I see the source code?

Yes. [GitHub](https://github.com/sooperD00/Hello_Eliza). The design decisions are annotated inline using a custom tagging syntax. The machine that explains itself is the machine that respects your mind.

---

### What is actual BASIC code that would run on an Apple II?

```BASIC
10 PRINT "HELLO!"
20 INPUT "PRESS RETURN TO CONTINUE...";A$
30 PRINT "WHAT IS YOUR NAME?"
40 INPUT E$
50 PRINT "HELLO " + E$ + ", NICE TO MEET YOU!"
60 INPUT "PRESS RETURN TO CONTINUE...";A$
70 PRINT "DO YOU WANT TO PLAY A GAME?"
80 INPUT A$
90 IF A$ = "YES" THEN PRINT "KNOCK KNOCK"
100 PRINT "WELCOME TO CYBERSPACE!!!!"
110 GOTO 100
```

---

### Why does `Ctrl+s` crash a home-built IBM beige box?

It doesn't, really. But it looked like it did.

`File > Save As` writes your whole file to disk in one complete operation. `Ctrl+s` is ... "smarter." It appends only what changed to the end of the file — those ghostly `$tmp` files in the explorer are the seams. Over time, the file becomes a chain of diffs, and one bad link breaks the whole thing.

The problem is that in 1993, "hard disk" meant an actual spinning magnetic platter, and "RAM" meant maybe 4 megabytes of DRAM that vanished the instant power dropped. If anything interrupted that short window — a flicker in the power supply, a kid bumping the desk, the OS deciding it had somewhere else to be — the temp file was corrupt, the original was already partially overwritten, and you were staring at a frozen screen. A little snowcrash in my childhood house.

Dad's machine was home-built from magazine parts and egghead.com discount bins. The power supply was probably marginal. The RAM was whatever came in those long clear tubes of bug-looking chips. It was not a machine that tolerated clever memory management. `File > Save As` was slow and dumb and bulletproof, and he was right.

He didn't know why he was right. He just knew that the careful way worked and the fast way sometimes didn't, and that was enough. It's a pretty good engineering heuristic, actually.

I don't do things the fast way either. I like to touch every part. I like to know everybody and everything's story. Here's a link to [the Cruft wikipedia page](https://en.wikipedia.org/wiki/Cruft).

---

### Who made this?

A console cowgirl, of course — An [*amateur*](https://en.wikipedia.org/wiki/Amateur) | [*GitHub*](https://github.com/sooperD00) | [*LinkedIn*](https://www.linkedin.com/in/nicole-rowsey)
