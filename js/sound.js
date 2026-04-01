// ============================================================
// Ringer — Synthesized Sound Effects (Web Audio API)
// ============================================================

const Sound = (() => {
    let audioCtx = null;
    let tickBuffers = [];    // Loaded WAV AudioBuffers
    let flapBuffer = null;   // Loaded WAV for score ticker flap
    let startBuffer = null;  // Loaded WAV for start button

    const TICK_FILES = [
        'sounds/tick-1.wav',
        'sounds/tick-2.wav',
        'sounds/tick-5.wav',
    ];

    function ensureContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Load tick WAV samples
    async function init() {
        const ctx = ensureContext();
        try {
            const buffers = await Promise.all(
                TICK_FILES.map(async (file) => {
                    const response = await fetch(file);
                    const arrayBuffer = await response.arrayBuffer();
                    return ctx.decodeAudioData(arrayBuffer);
                })
            );
            tickBuffers = buffers;
            console.log(`[Sound] Loaded ${tickBuffers.length} tick samples`);

            // Load flap (score ticker) sample
            const flapResponse = await fetch('sounds/tick-12.wav');
            const flapArrayBuffer = await flapResponse.arrayBuffer();
            flapBuffer = await ctx.decodeAudioData(flapArrayBuffer);
            console.log('[Sound] Loaded flap sample');

            // Load start button sample
            const startResponse = await fetch('sounds/tick-17.wav');
            const startArrayBuffer = await startResponse.arrayBuffer();
            startBuffer = await ctx.decodeAudioData(startArrayBuffer);
            console.log('[Sound] Loaded start sample');
        } catch (e) {
            console.warn('[Sound] Failed to load samples:', e);
        }
    }

    // Play a random tick sample
    function playTick() {
        if (tickBuffers.length === 0) return;
        const ctx = ensureContext();
        const buffer = tickBuffers[Math.floor(Math.random() * tickBuffers.length)];
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(ctx.currentTime);
    }

    // Score ticker flap — plays tick-12.wav sample
    function playFlap() {
        if (!flapBuffer) return;
        const ctx = ensureContext();
        const source = ctx.createBufferSource();
        source.buffer = flapBuffer;
        source.connect(ctx.destination);
        source.start(ctx.currentTime);
    }

    // Points bell: ~600ms chime for scoring 1 or 2 points
    function playPoints() {
        const ctx = ensureContext();
        const now = ctx.currentTime;

        const harmonics = [880, 1320, 1760];

        harmonics.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;

            const gain = ctx.createGain();
            const startGain = 0.25 / (i + 1);
            gain.gain.setValueAtTime(startGain, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.65);
        });
    }

    // Ringer bell: triple ascending chime (C5 → E5 → G5)
    function playRinger() {
        const ctx = ensureContext();
        const now = ctx.currentTime;

        const notes = [
            { freq: 523, time: 0,    gain: 0.18, decay: 0.3  }, // C5
            { freq: 659, time: 0.1,  gain: 0.20, decay: 0.3  }, // E5
            { freq: 784, time: 0.2,  gain: 0.25, decay: 0.5  }, // G5
        ];

        notes.forEach(n => {
            // Bell-like inharmonic partial ratios
            [1, 2.76, 5.4].forEach((ratio, i) => {
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = n.freq * ratio;

                const gain = ctx.createGain();
                const vol = n.gain / (i * 1.5 + 1);
                gain.gain.setValueAtTime(vol, now + n.time);
                gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.decay);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now + n.time);
                osc.stop(now + n.time + n.decay + 0.05);
            });
        });
    }

    function playStart() {
        if (!startBuffer) return;
        const ctx = ensureContext();
        const source = ctx.createBufferSource();
        source.buffer = startBuffer;
        source.connect(ctx.destination);
        source.start(ctx.currentTime);
    }

    return { init, ensureContext, playTick, playFlap, playPoints, playRinger, playStart };
})();
