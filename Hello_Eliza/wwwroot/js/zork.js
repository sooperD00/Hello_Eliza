/**
 * ZORK - A conversational discovery layer
 * Turn 1-2: ASCII art
 * Turn 3: "Do you like my art?"
 * Turn 4+: Pattern match → response, else → ASCII art
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

        // Always render unlocked links, even on non-terminal pages
        renderUnlocked();

        if (!form || !input) return;

        // Create zork-output if missing
        if (!zorkOutput) {
            zorkOutput = document.createElement('div');
            zorkOutput.className = 'zork-output';
            document.querySelector('.terminal').insertAdjacentElement('afterend', zorkOutput);
        }

        try {
            const response = await fetch(RULES_PATH);
            rules = await response.json();
        } catch (e) {
            console.error('Zork: Failed to load rules', e);
        }

        form.addEventListener('submit', handleSubmit);
        renderUnlocked();
        resetIdleTimer();
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        const text = input.value.trim();
        if (!text) return;

        turnCount++;
        sessionStorage.setItem('zorkTurn', turnCount.toString());

        console.log('Turn:', turnCount, 'Text:', text);

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

        for (const rule of rules.rules) {
            if (rule.fallback) {
                fallbackRule = rule;  // save for later
                continue;
            }
            
            const regex = new RegExp(rule.match, 'i');
            if (regex.test(lower)) {
                if (rule.action) {
                    unlock(rule.action);
                    goTo(rule.action);
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

    function unlock(path) {
        // Only track internal links
        if (!path.startsWith('/')) return;

        if (!unlocked.includes(path)) {
            unlocked.push(path);
            sessionStorage.setItem('zorkUnlocked', JSON.stringify(unlocked));
            renderUnlocked();
        }
    }

    function renderUnlocked() {
        const container = document.getElementById('nav-discovered');
        if (!container) return;
        
        if (unlocked.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = unlocked.map(path => {
            const label = path.replace(/^\//, '');  // "/essays" → "essays"
            return `<a href="${path}" class="nav-link discovered">${label}</a>`;
        }).join('');
    }

    // intermittent reinforcement
    function resetIdleTimer() {
        if (idleTimer) clearTimeout(idleTimer);
        
        if (turnCount >= 3 && rules?.idle) {
            const minDelay = 30000;  // 30 seconds
            const maxDelay = 60000;  // 1 minute
            const delay = minDelay + Math.random() * (maxDelay - minDelay);
            
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