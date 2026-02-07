/**
 * ZORK - A conversational discovery layer
 * Turn 1-2: ASCII art
 * Turn 3: "Do you like my art?"
 * Turn 4+: Pattern match → response, else → ASCII art
 * 
 * Nav discovery: internal paths reveal as nav links with a 
 * Snow Crash-flavored glitch animation. First match = reveal.
 * Second match = navigate. External links still open in a new tab.
 */

(function() {
    'use strict';

    const RULES_PATH = '/data/zork-rules.json';
    
    let turnCount = parseInt(sessionStorage.getItem('zorkTurn') || '0', 10);
    let rules = null;
    let unlocked = JSON.parse(sessionStorage.getItem('zorkUnlocked') || '[]');
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
        if (turnCount <= 3) {
            const matched = tryPatternMatch(text);
            if (matched) return cleanup();
        }

        // Normal turn-based flow
        if (turnCount <= 2) {
            // Turns 1-2: ASCII art
            await doAscii(text);
        } else if (turnCount === 3) {
            // Turn 3: The turn
            displayZork(rules?.turn_message || "Do you like my art?");
        } else {
            // Turn 4+: Try pattern match, fallback to ASCII
            const matched = tryPatternMatch(text);
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
        const formData = new FormData();
        formData.append('UserInput', text);

        try {
            const response = await fetch(form.action || '/Ascii/Input', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const ascii = doc.querySelector('pre')?.textContent || text;
                
                zorkOutput.innerHTML = `<pre>${ascii}</pre>`;
            }
        } catch (e) {
            console.error('ASCII fetch failed', e);
        }
    }

    function tryPatternMatch(text) {
        if (!rules?.rules) return false;

        const lower = text.toLowerCase();
        let fallbackRule = null;

        // *poof* reset - clear session storage
        if (/^(reset|restart|xyzzy)$/i.test(lower)) {
            sessionStorage.removeItem('zorkTurn');
            sessionStorage.removeItem('zorkUnlocked');
            location.reload();
            return true;
        }

        for (const rule of rules.rules) {
            if (rule.fallback) {
                fallbackRule = rule;  // save for later
                continue;
            }
            
            const regex = new RegExp(rule.match, 'i');
            if (regex.test(lower)) {
                if (rule.action) {
                    if (rule.action.startsWith('/')) {
                        // Internal path: first match = discover, repeat = navigate
                        if (unlocked.includes(rule.action)) {
                            goTo(rule.action);
                        } else {
                            unlock(rule.action);
                            const label = rule.action.replace(/^\//, '');
                            displayZork(``);
                        }
                    } else {
                        // External link: open immediately
                        window.open(rule.action, '_blank');
                    }
                    return true;
                }
                if (rule.reply) {
                    const reply = Array.isArray(rule.reply) 
                        ? rule.reply[Math.floor(Math.random() * rule.reply.length)]
                        : rule.reply;
                    displayZork(reply);
                    return true;
                }
            }
        }
        
        // Nothing matched — 50% chance fallback reply, 50% ASCII
        if (fallbackRule && Math.random() < 0.5) {
            const reply = Array.isArray(fallbackRule.reply)
                ? fallbackRule.reply[Math.floor(Math.random() * fallbackRule.reply.length)]
                : fallbackRule.reply;
            displayZork(reply);
            return true;
        }
        
        return false;  // → triggers ASCII
    }

    function displayZork(message) {
        zorkOutput.innerHTML = `<p>${message}</p>`;
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
