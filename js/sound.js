// ============================================================
// Ringer — Synthesized Sound Effects (Web Audio API)
// ============================================================

const Sound = (() => {
    let audioCtx = null;

    function ensureContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Typewriter tick: ~20-25ms sharp mechanical click
    function playTick() {
        const ctx = ensureContext();
        const now = ctx.currentTime;

        // --- Layer 1: Noise burst (18ms) ---
        const noiseDuration = 0.018;
        const sampleRate = ctx.sampleRate;
        const noiseLength = Math.floor(sampleRate * noiseDuration);
        const noiseBuffer = ctx.createBuffer(1, noiseLength, sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);

        // White noise with exponential decay
        const decayConstant = noiseLength * 0.04;
        for (let i = 0; i < noiseLength; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / decayConstant);
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        // Highpass at 2kHz
        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 2000;

        // Peaking EQ at 4kHz, Q=3, gain=8dB
        const peaking = ctx.createBiquadFilter();
        peaking.type = 'peaking';
        peaking.frequency.value = 4000;
        peaking.Q.value = 3;
        peaking.gain.value = 8;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.6, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.020);

        noiseSource.connect(highpass);
        highpass.connect(peaking);
        peaking.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noiseSource.start(now);
        noiseSource.stop(now + noiseDuration);

        // --- Layer 2: Metal strike (12ms) ---
        const metalOsc = ctx.createOscillator();
        metalOsc.type = 'triangle';
        metalOsc.frequency.value = 3800;

        const metalGain = ctx.createGain();
        metalGain.gain.setValueAtTime(0.15, now);
        metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

        metalOsc.connect(metalGain);
        metalGain.connect(ctx.destination);

        metalOsc.start(now);
        metalOsc.stop(now + 0.012);

        // --- Layer 3: Low thunk (18ms) ---
        const thunkOsc = ctx.createOscillator();
        thunkOsc.type = 'sine';
        thunkOsc.frequency.value = 300;

        const thunkGain = ctx.createGain();
        thunkGain.gain.setValueAtTime(0.12, now);
        thunkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

        thunkOsc.connect(thunkGain);
        thunkGain.connect(ctx.destination);

        thunkOsc.start(now);
        thunkOsc.stop(now + 0.018);
    }

    // Split-flap mechanical clack: flap swing → impact → housing resonance
    function playFlap() {
        const ctx = ensureContext();
        const now = ctx.currentTime;
        const sr = ctx.sampleRate;

        // --- Layer 1: Flap swing whoosh (40ms) ---
        // Low rumble building up before the impact
        const whooshDur = 0.040;
        const whooshLen = Math.floor(sr * whooshDur);
        const whooshBuf = ctx.createBuffer(1, whooshLen, sr);
        const whooshData = whooshBuf.getChannelData(0);
        for (let i = 0; i < whooshLen; i++) {
            // Noise that ramps UP (reverse envelope) to build into the clack
            const t = i / whooshLen;
            whooshData[i] = (Math.random() * 2 - 1) * t * t;
        }
        const whooshSrc = ctx.createBufferSource();
        whooshSrc.buffer = whooshBuf;

        const whooshLp = ctx.createBiquadFilter();
        whooshLp.type = 'lowpass';
        whooshLp.frequency.value = 1200;

        const whooshGain = ctx.createGain();
        whooshGain.gain.setValueAtTime(0.15, now);
        whooshGain.gain.linearRampToValueAtTime(0.25, now + whooshDur);

        whooshSrc.connect(whooshLp);
        whooshLp.connect(whooshGain);
        whooshGain.connect(ctx.destination);
        whooshSrc.start(now);
        whooshSrc.stop(now + whooshDur);

        // --- Layer 1b: Paper flutter (45ms) ---
        // High-frequency noise with rapid AM to simulate a card flipping through air
        const flutterDur = 0.045;
        const flutterLen = Math.floor(sr * flutterDur);
        const flutterBuf = ctx.createBuffer(1, flutterLen, sr);
        const flutterData = flutterBuf.getChannelData(0);
        for (let i = 0; i < flutterLen; i++) {
            const t = i / flutterLen;
            // Rapid amplitude modulation (~120Hz) gives fluttery texture
            const flutter = Math.sin(t * Math.PI * 120) * 0.5 + 0.5;
            // Bell-shaped envelope: rises then falls before impact
            const env = Math.sin(t * Math.PI);
            flutterData[i] = (Math.random() * 2 - 1) * flutter * env;
        }
        const flutterSrc = ctx.createBufferSource();
        flutterSrc.buffer = flutterBuf;

        // Highpass keeps it airy/papery, not bassy
        const flutterHp = ctx.createBiquadFilter();
        flutterHp.type = 'highpass';
        flutterHp.frequency.value = 3500;

        // Gentle peak around 6kHz for that papery swish
        const flutterPk = ctx.createBiquadFilter();
        flutterPk.type = 'peaking';
        flutterPk.frequency.value = 6000;
        flutterPk.Q.value = 1.5;
        flutterPk.gain.value = 4;

        const flutterGain = ctx.createGain();
        flutterGain.gain.setValueAtTime(0.18, now);
        flutterGain.gain.linearRampToValueAtTime(0.10, now + flutterDur);

        flutterSrc.connect(flutterHp);
        flutterHp.connect(flutterPk);
        flutterPk.connect(flutterGain);
        flutterGain.connect(ctx.destination);
        flutterSrc.start(now);
        flutterSrc.stop(now + flutterDur);

        // --- Layer 2: Impact clack (broadband noise burst, 30ms) ---
        // The main "clack" — harder and longer than a tap
        const impactTime = now + 0.035; // hits just as whoosh peaks
        const clackDur = 0.030;
        const clackLen = Math.floor(sr * clackDur);
        const clackBuf = ctx.createBuffer(1, clackLen, sr);
        const clackData = clackBuf.getChannelData(0);
        for (let i = 0; i < clackLen; i++) {
            clackData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (clackLen * 0.08));
        }
        const clackSrc = ctx.createBufferSource();
        clackSrc.buffer = clackBuf;

        // Shape it: lowpass keeps it chunky, peaking adds the plastic crack
        const clackLp = ctx.createBiquadFilter();
        clackLp.type = 'lowpass';
        clackLp.frequency.value = 5000;

        const clackPeak = ctx.createBiquadFilter();
        clackPeak.type = 'peaking';
        clackPeak.frequency.value = 2200;
        clackPeak.Q.value = 2;
        clackPeak.gain.value = 6;

        const clackGain = ctx.createGain();
        clackGain.gain.setValueAtTime(0.5, impactTime);
        clackGain.gain.exponentialRampToValueAtTime(0.01, impactTime + 0.035);

        clackSrc.connect(clackLp);
        clackLp.connect(clackPeak);
        clackPeak.connect(clackGain);
        clackGain.connect(ctx.destination);
        clackSrc.start(impactTime);
        clackSrc.stop(impactTime + clackDur);

        // --- Layer 3: Metal strike ring (resonant ping at impact) ---
        const strikeOsc = ctx.createOscillator();
        strikeOsc.type = 'square';
        strikeOsc.frequency.value = 1800;

        const strikeGain = ctx.createGain();
        strikeGain.gain.setValueAtTime(0.07, impactTime);
        strikeGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 0.025);

        strikeOsc.connect(strikeGain);
        strikeGain.connect(ctx.destination);
        strikeOsc.start(impactTime);
        strikeOsc.stop(impactTime + 0.030);

        // --- Layer 4: Rattle tail (filtered noise decay, 50ms) ---
        // The flap settling/bouncing after impact
        const rattleDur = 0.050;
        const rattleLen = Math.floor(sr * rattleDur);
        const rattleBuf = ctx.createBuffer(1, rattleLen, sr);
        const rattleData = rattleBuf.getChannelData(0);
        for (let i = 0; i < rattleLen; i++) {
            // Decaying noise with slight pulsing (simulates bounce)
            const t = i / rattleLen;
            const bounce = 1 + 0.3 * Math.sin(t * Math.PI * 6);
            rattleData[i] = (Math.random() * 2 - 1) * (1 - t) * (1 - t) * bounce;
        }
        const rattleSrc = ctx.createBufferSource();
        rattleSrc.buffer = rattleBuf;

        const rattleBp = ctx.createBiquadFilter();
        rattleBp.type = 'bandpass';
        rattleBp.frequency.value = 2800;
        rattleBp.Q.value = 1.0;

        const rattleGain = ctx.createGain();
        rattleGain.gain.setValueAtTime(0.12, impactTime + 0.005);
        rattleGain.gain.exponentialRampToValueAtTime(0.001, impactTime + rattleDur);

        rattleSrc.connect(rattleBp);
        rattleBp.connect(rattleGain);
        rattleGain.connect(ctx.destination);
        rattleSrc.start(impactTime + 0.005);
        rattleSrc.stop(impactTime + rattleDur);
    }

    // Ringer bell: ~600ms celebratory chime
    function playRinger() {
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

    return { ensureContext, playTick, playFlap, playRinger };
})();
