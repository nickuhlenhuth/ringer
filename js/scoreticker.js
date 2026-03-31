// ============================================================
// Ringer — Score Ticker (Split-Flap Train Station Display)
// ============================================================

const ScoreTicker = (() => {
    let p1Tens, p1Ones, p2Tens, p2Ones;
    const FLIP_STEP_MS = 400; // ms per digit flip step

    function init() {
        p1Tens = document.getElementById('p1-tens');
        p1Ones = document.getElementById('p1-ones');
        p2Tens = document.getElementById('p2-tens');
        p2Ones = document.getElementById('p2-ones');

        [p1Tens, p1Ones, p2Tens, p2Ones].forEach(buildFlapStructure);
    }

    /** Replace bare text node with upper/lower halves for split-flap effect */
    function buildFlapStructure(el) {
        const val = el.textContent.trim();
        el.textContent = '';
        el.dataset.value = val;

        const upper = document.createElement('div');
        upper.className = 'digit-upper';
        upper.textContent = val;

        const lower = document.createElement('div');
        lower.className = 'digit-lower';
        lower.textContent = val;

        el.appendChild(upper);
        el.appendChild(lower);
    }

    /**
     * Animate one digit step (oldVal → newVal) with a 3D flap.
     * Returns a Promise that resolves when the flip finishes.
     */
    function flipOnce(el, oldVal, newVal) {
        return new Promise(resolve => {
            const upper = el.querySelector('.digit-upper');
            const lower = el.querySelector('.digit-lower');

            // --- Falling flap (top half, shows OLD value, folds down) ---
            const falling = document.createElement('div');
            falling.className = 'flap flap-fall';
            falling.textContent = oldVal;
            el.appendChild(falling);

            // Immediately show new value in the upper static half (revealed behind flap)
            upper.textContent = newVal;

            // --- Rising flap (bottom half, shows NEW value, folds up into place) ---
            const rising = document.createElement('div');
            rising.className = 'flap flap-rise';
            rising.textContent = newVal;
            el.appendChild(rising);

            // Play the mechanical clack ~halfway through (when flap hits)
            setTimeout(() => Sound.playFlap(), FLIP_STEP_MS * 0.45);

            // After full duration, clean up and update static halves
            setTimeout(() => {
                lower.textContent = newVal;
                el.dataset.value = String(newVal);
                falling.remove();
                rising.remove();
                resolve();
            }, FLIP_STEP_MS);
        });
    }

    /**
     * Cycle a single digit element from its current value up to targetVal,
     * flipping through each intermediate digit (wrapping 9→0).
     */
    async function flipDigit(el, targetVal) {
        let current = parseInt(el.dataset.value);
        const target = parseInt(targetVal);
        if (current === target) return;

        while (current !== target) {
            const next = (current + 1) % 10;
            await flipOnce(el, current, next);
            current = next;
        }
    }

    /**
     * Set a player's score with the full split-flap animation.
     * Ones digit flips first, then tens — each flap is distinct and sequential.
     */
    async function setScore(player, score) {
        score = Math.min(99, Math.max(0, score));
        const tens = Math.floor(score / 10);
        const ones = score % 10;

        const [tensEl, onesEl] = player === 1
            ? [p1Tens, p1Ones]
            : [p2Tens, p2Ones];

        // Flip ones first, then tens — fully sequential so each flap is distinct
        await flipDigit(onesEl, ones);
        await flipDigit(tensEl, tens);
    }

    function reset() {
        [p1Tens, p1Ones, p2Tens, p2Ones].forEach(el => {
            if (!el) return;
            el.dataset.value = '0';
            const upper = el.querySelector('.digit-upper');
            const lower = el.querySelector('.digit-lower');
            if (upper) upper.textContent = '0';
            if (lower) lower.textContent = '0';
        });
    }

    return { init, setScore, reset };
})();
