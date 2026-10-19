/**
 * ZORK - A conversational discovery layer
 * Turn 1-2: ASCII art
 * Turn 3: "Do you like my art?"
 * Turn 4+: Pattern match → response, else → coin flip (ELIZA remark or ASCII art)
 * 
 * Nav discovery: internal paths reveal as nav links with a 
 * Snow Crash-flavored glitch animation. First match = reveal.
 * Second match = navigate. External links still open in a new tab.
 *
 * Rule fields (zork-rules.json, first match wins):
 *   match    regex, case-insensitive
 *   action   "/path" (reveal, then navigate) or "https://..." (new tab)
 *   reply    string or array (one picked at random)
 *   say      line built from the match, $1 = first capture group; runs action after
 *   reset    true = say the reply, forget everything, reload
 *   fallback true = coin-flip replies when nothing matches (no match field)
 *
 * Paths (zork-rules.json "paths"): a scripted conversation that remembers
 * which beat it's on. Once a path starts, each input gets the next step,
 * whatever it says (reset words still win). Path fields:
 *   name                 id, stored in sessionStorage while the path runs
 *   start                regex that starts it
 *   after_turn_question  true = only as the answer to "do you like my art?"
 *   steps                one per input, in order
 * Step fields (all optional, run in this order):
 *   if / then / else     regex on the input; run the then- or else-step
 *   frames               lines shown one after another (frame_ms apart, default 350)
 *   art                  true = render their input as ASCII; "text" = render that
 *   say                  a line (under the art, if there is art)
 *   go                   "/path": reveal the link, let it glitch in, then go there
 */

(function() {
    'use strict';

    const RULES_PATH = '/data/zork-rules.json';
    
    let turnCount = parseInt(sessionStorage.getItem('zorkTurn') || '0', 10);
    let rules = null;
    let unlocked = JSON.parse(sessionStorage.getItem('zorkUnlocked') || '[]');
    let path = JSON.parse(sessionStorage.getItem('zorkPath') || 'null');  // { name, step }
    let awaitingTurnAnswer = sessionStorage.getItem('zorkAwaiting') === 'turn';
    let idleTimer = null;

    let form, input, zorkOutput;

    async function init() {
        form = document.querySelector('form');
        input = document.querySelector('input[name="UserInput"]');
        zorkOutput = document.querySelector('.zork-output');

        try {
            const response = await fetch(RULES_PATH);
            rules = await response.json();
        } catch (e) {
            console.error('Zork: Failed to load rules', e);
        }

        // Render nav slots (all of them — discovered ones visible, rest invisible)
        renderNavSlots();

        if (!form || !input) return;

        if (!zorkOutput) {
            zorkOutput = document.createElement('div');
            zorkOutput.className = 'zork-output';
            document.querySelector('.terminal').insertAdjacentElement('afterend', zorkOutput);
        }

        form.addEventListener('submit', handleSubmit);
        resetIdleTimer();
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        const text = input.value.trim();
        if (!text) return;

        turnCount++;
        sessionStorage.setItem('zorkTurn', turnCount.toString());

        console.log('Turn:', turnCount, 'Text:', text);

        // Experienced user? Let them skip the intro.
        // (No coin-flip fallback here, or it would eat the ASCII intro.)
        if (turnCount <= 3) {
            const matched = tryPatternMatch(text, false);
            if (matched) return cleanup();
        }

        // Normal turn-based flow
        if (turnCount <= 2) {
            // Turns 1-2: ASCII art
            await doAscii(text);
        } else if (turnCount === 3) {
            // Turn 3: The turn
            displayZork(rules?.turn_message || "Do you like my art?");
            setAwaiting(true);
        } else {
            // Turn 4+: a path in progress (or starting) goes first
            if (await tryPath(text)) return cleanup();

            // Then pattern match, fallback to ASCII
            const matched = tryPatternMatch(text, true);
            if (!matched) {
                await doAscii(text);
            }
        }

        cleanup();
    }

    function cleanup() {
        input.value = '';
        input.focus();
        resetIdleTimer();
    }

    async function doAscii(text) {
        const ascii = await fetchAscii(text);
        if (ascii !== null) showAscii(ascii);
    }

    // Ask the server to render text as ASCII art. null if that fails.
    async function fetchAscii(text) {
        const formData = new FormData();
        formData.append('UserInput', text);

        try {
            const response = await fetch(form.action || '/Ascii/Input', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) return null;

            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            return doc.querySelector('pre')?.textContent || text;
        } catch (e) {
            console.error('ASCII fetch failed', e);
            return null;
        }
    }

    // textContent, not innerHTML: the visitor's words stay words.
    function showAscii(ascii, line) {
        const pre = document.createElement('pre');
        pre.textContent = ascii;
        const nodes = [pre];
        if (line) {
            const p = document.createElement('p');
            p.textContent = line;
            nodes.push(p);
        }
        zorkOutput.replaceChildren(...nodes);
    }

    // ── Paths (scripted conversations) ──────────────────────────

    async function tryPath(text) {
        if (!rules?.paths) return false;
        const lower = text.toLowerCase();

        // Reset words always win, even mid-path
        if (rules.rules?.some(r => r.reset && new RegExp(r.match, 'i').test(lower))) {
            return false;
        }

        // The art question only gets one answer
        const wasAwaiting = awaitingTurnAnswer;
        setAwaiting(false);

        // Not on a path yet? See if this input starts one.
        if (!path) {
            const starting = rules.paths.find(p =>
                (!p.after_turn_question || wasAwaiting) &&
                new RegExp(p.start, 'i').test(lower));
            if (!starting) return false;
            setPath({ name: starting.name, step: 0 });
        }

        const def = rules.paths.find(p => p.name === path.name);
        const step = def?.steps?.[path.step];
        if (!step) {
            setPath(null);  // rules changed under us; let go quietly
            return false;
        }

        // Move to the next beat (or off the path) before acting
        setPath(path.step + 1 < def.steps.length
            ? { name: def.name, step: path.step + 1 }
            : null);

        await runStep(step, text, lower);
        return true;
    }

    async function runStep(step, text, lower) {
        if (step.if) {
            const branch = new RegExp(step.if, 'i').test(lower) ? step.then : step.else;
            if (branch) await runStep(branch, text, lower);
            return;
        }

        if (step.frames) {
            for (const frame of step.frames) {
                displayText(frame);
                await new Promise(r => setTimeout(r, step.frame_ms || 350));
            }
        }

        if (step.art !== undefined) {
            const source = step.art === true ? text : step.art;
            const ascii = await fetchAscii(source);
            showAscii(ascii ?? source, step.say);
        } else if (step.say) {
            displayText(step.say);
        }

        if (step.go) {
            // Reveal the link, let the glitch play, then walk them through it
            unlock(step.go);
            setTimeout(() => goTo(step.go), 1500);
        }
    }

    function setPath(p) {
        path = p;
        if (p) sessionStorage.setItem('zorkPath', JSON.stringify(p));
        else sessionStorage.removeItem('zorkPath');
    }

    function setAwaiting(on) {
        awaitingTurnAnswer = on;
        if (on) sessionStorage.setItem('zorkAwaiting', 'turn');
        else sessionStorage.removeItem('zorkAwaiting');
    }

    function pick(reply) {
        return Array.isArray(reply)
            ? reply[Math.floor(Math.random() * reply.length)]
            : reply;
    }

    function tryPatternMatch(text, allowFallback) {
        if (!rules?.rules) return false;

        const lower = text.toLowerCase();
        let fallbackRule = null;

        for (const rule of rules.rules) {
            if (rule.fallback) {
                fallbackRule = rule;  // save for later
                continue;
            }
            
            const regex = new RegExp(rule.match, 'i');
            if (regex.test(lower)) {
                if (rule.reset) {
                    // *poof* - say it, forget everything, start over
                    displayZork(pick(rule.reply) || '*poof*');
                    ['zorkTurn', 'zorkUnlocked', 'zorkPath', 'zorkAwaiting']
                        .forEach(key => sessionStorage.removeItem(key));
                    setTimeout(() => location.reload(), 900);
                    return true;
                }
                if (rule.say) {
                    // Say a line built from the match ($1 = first capture group),
                    // then do the action. "nice" → "n .. ice" → privacy.
                    const m = lower.match(regex);
                    displayText(rule.say.replace(/\$(\d)/g, (_, i) => m?.[i] ?? ''));
                    if (rule.action?.startsWith('/')) {
                        // Wait a beat so the line lands before the reveal (or the yank)
                        setTimeout(() => runAction(rule.action, true), 900);
                    } else if (rule.action) {
                        // External links can't wait: browsers block delayed pop-ups
                        runAction(rule.action, true);
                    }
                    return true;
                }
                if (rule.action) {
                    runAction(rule.action, false);
                    return true;
                }
                if (rule.reply) {
                    displayZork(pick(rule.reply));
                    return true;
                }
            }
        }

        // Nothing matched — 50% chance fallback reply, 50% ASCII.
        // The fallback replies are Weizenbaum's own "content-free remarks"
        // from the 1966 paper (docs/weizenbaum1966.pdf).
        if (allowFallback && fallbackRule && Math.random() < 0.5) {
            displayZork(pick(fallbackRule.reply));
            return true;
        }
        
        return false;  // → triggers ASCII
    }

    function runAction(action, keepMessage) {
        if (action.startsWith('/')) {
            // Internal path: first match = discover, repeat = navigate
            if (unlocked.includes(action)) {
                goTo(action);
            } else {
                unlock(action);
                if (!keepMessage) clearZork();
            }
        } else {
            // External link: open immediately
            window.open(action, '_blank');
        }
    }

    function displayZork(message) {
        zorkOutput.innerHTML = `<p>${message}</p>`;
    }

    // For lines that contain the visitor's own words: text, never markup
    function displayText(message) {
        const p = document.createElement('p');
        p.textContent = message;
        zorkOutput.replaceChildren(p);
    }

    function displayIdle(message) {
        zorkOutput.innerHTML = `<p class="idle">${message}</p>`;
    }

    function clearZork() {
        zorkOutput.innerHTML = '';
    }

    function goTo(url) {
        if (url.startsWith('http')) {
            window.open(url, '_blank');
        } else {
            window.location.href = url;
        }
    }

    // ── Nav slot rendering ──────────────────────────────────────

    function renderNavSlots() {
        const container = document.getElementById('nav-discovered');
        if (!container || !rules?.nav_slots) return;

        container.innerHTML = rules.nav_slots.map(slot => {
            const isDiscovered = unlocked.includes(slot.path);
            const cls = isDiscovered ? 'nav-slot discovered' : 'nav-slot';
            return `<a href="${slot.path}" class="${cls}" data-path="${slot.path}">${slot.label}</a>`;
        }).join('');
    }

    function unlock(path) {
        // Only track internal links
        if (!path.startsWith('/')) return;
        if (unlocked.includes(path)) return;

        unlocked.push(path);
        sessionStorage.setItem('zorkUnlocked', JSON.stringify(unlocked));

        // Find the pre-rendered slot and animate it
        const slot = document.querySelector(`.nav-slot[data-path="${path}"]`);
        if (slot) {
            slot.classList.add('discovered', 'discovering');
            slot.addEventListener('animationend', () => {
                slot.classList.remove('discovering');
            }, { once: true });
        }
    }

    // ── Idle timer (intermittent reinforcement) ─────────────────

    function resetIdleTimer() {
        if (idleTimer) clearTimeout(idleTimer);
        
        if (turnCount >= 3 && rules?.idle) {
            const delay = 30000 + Math.random() * 30000;
            idleTimer = setTimeout(() => {
                const msg = rules.idle[Math.floor(Math.random() * rules.idle.length)];
                displayIdle(msg);
            }, delay);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
