/**
 * ZORK - An interactive discovery experience
 * Inspired by Zork, Myst, ELIZA, and the old internet
 * 
 * State machine that transforms a simple ASCII art generator
 * into a conversation with the website itself.
 */

(function() {
    'use strict';

    // --- Configuration ---
    const RULES_PATH = '/data/zork-rules.json';
    
    // --- State ---
    let state = sessionStorage.getItem('zorkState') || 'INTRO_1';
    let interactionCount = parseInt(sessionStorage.getItem('zorkCount') || '0', 10);
    let rules = null;
    let idleTimers = [];
    let unlocked = JSON.parse(sessionStorage.getItem('zorkUnlocked') || '[]');

    // --- DOM Elements (set on init) ---
    let form, input, output;

    // --- Initialize ---
    async function init() {
        // Find existing elements from the page
        form = document.querySelector('form');
        input = document.querySelector('input[type="text"], input[name="UserInput"]');
        output = document.querySelector('pre, .ascii-output, #output');

        if (!form || !input) {
            console.warn('Zork: Required elements not found');
            return;
        }

        // Create output area if needed
        if (!output) {
            output = document.createElement('div');
            output.id = 'zork-output';
            form.parentNode.insertBefore(output, form.nextSibling);
        }

        // Load rules
        try {
            const response = await fetch(RULES_PATH);
            rules = await response.json();
        } catch (e) {
            console.error('Zork: Failed to load rules', e);
            return;
        }

        // Intercept form submission
        form.addEventListener('submit', handleSubmit);

        // Start idle timer
        resetIdleTimers();

        // Render unlocked links
        renderUnlocked();

        console.log('Zork initialized. State:', state);
    }

    // --- Form Handler ---
    async function handleSubmit(e) {
        e.preventDefault();
        
        const text = input.value.trim();
        if (!text) return;

        resetIdleTimers();
        interactionCount++;
        sessionStorage.setItem('zorkCount', interactionCount.toString());

        switch (state) {
            case 'INTRO_1':
                await doAscii(text);
                state = 'INTRO_2';
                break;

            case 'INTRO_2':
                await doAscii(text);
                state = 'TURN';
                break;

            case 'TURN':
                displayTurn(rules.turn_message);
                state = 'CONVO';
                break;

            case 'CONVO':
                handleConvo(text);
                break;
        }

        sessionStorage.setItem('zorkState', state);
        input.value = '';
        input.focus();
    }

    // --- ASCII Art (calls your existing backend) ---
    async function doAscii(text) {
        try {
            // POST to your existing endpoint
            const formData = new FormData();
            formData.append('UserInput', text);

            const response = await fetch(form.action || '/Ascii/Input', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const html = await response.text();
                // Extract just the ASCII output from the response
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const ascii = doc.querySelector('pre, .ascii-output')?.textContent || text;
                displayAscii(ascii);
            }
        } catch (e) {
            console.error('ASCII fetch failed', e);
            displayMessage('> ' + text);
        }
    }

    // --- Conversation Handler ---
    function handleConvo(text) {
        const lower = text.toLowerCase();

        for (const rule of rules.rules) {
            const regex = new RegExp(rule.match, 'i');
            if (regex.test(lower)) {
                if (rule.action) {
                    unlock(rule.action);
                    goTo(rule.action);
                    return;
                }
                if (rule.reply) {
                    const reply = pickRandom(rule.reply);
                    displayMessage(reply);
                    return;
                }
            }
        }

        // Fallback (should be caught by .* rule)
        displayMessage('...');
    }

    // --- Display Functions ---
    function displayAscii(text) {
        output.innerHTML = '';
        const pre = document.createElement('pre');
        pre.className = 'ascii-art';
        pre.textContent = text;
        output.appendChild(pre);
    }

    function displayTurn(message) {
        output.innerHTML = '';
        const p = document.createElement('p');
        p.className = 'zork-turn';
        p.textContent = message;
        output.appendChild(p);
    }

    function displayMessage(message) {
        const p = document.createElement('p');
        p.className = 'zork-message';
        p.textContent = message;
        output.appendChild(p);

        // Keep conversation scrolled
        output.scrollTop = output.scrollHeight;
    }

    function displayIdle(message) {
        const p = document.createElement('p');
        p.className = 'zork-idle';
        p.textContent = message;
        output.appendChild(p);
    }

    // --- Navigation ---
    function goTo(url) {
        if (url.startsWith('http')) {
            window.open(url, '_blank');
        } else {
            window.location.href = url;
        }
    }

    // --- Unlocked Links ---
    function unlock(path) {
        if (!unlocked.includes(path)) {
            unlocked.push(path);
            sessionStorage.setItem('zorkUnlocked', JSON.stringify(unlocked));
            renderUnlocked();
        }
    }

    function renderUnlocked() {
        let container = document.getElementById('zork-unlocked');
        if (!container) {
            container = document.createElement('nav');
            container.id = 'zork-unlocked';
            document.body.appendChild(container);
        }

        if (unlocked.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        container.innerHTML = unlocked.map(path => {
            const label = path.replace(/^\//, '').replace(/^https?:\/\/[^/]+\//, '');
            return `<a href="${path}" class="unlocked-link">${label}</a>`;
        }).join(' · ');
    }

    // --- Idle Timers ---
    function resetIdleTimers() {
        idleTimers.forEach(t => clearTimeout(t));
        idleTimers = [];

        if (state !== 'CONVO' || !rules?.idle) return;

        rules.idle.forEach(({ delay, message }) => {
            const timer = setTimeout(() => {
                displayIdle(message);
            }, delay);
            idleTimers.push(timer);
        });
    }

    // --- Utilities ---
    function pickRandom(arr) {
        if (typeof arr === 'string') return arr;
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // --- Start ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
