"""
Generate a chunky mechanical click sound reminiscent of the Ringer arcade game.
Produces a short, sharp typewriter-style mechanical click as a WAV file.
"""

import wave
import struct
import math
import random

SAMPLE_RATE = 44100

def generate_click(filename="tick.wav"):
    """
    Synthesize a chunky mechanical click sound.

    The sound layers:
    1. A sharp initial transient (the "snap" of the mechanism)
    2. A low-frequency thump (the body/weight of the mechanism)
    3. A brief metallic resonance (spring/lever vibration)
    4. A subtle secondary click (mechanism settling)
    """
    duration_ms = 80  # Short and punchy
    num_samples = int(SAMPLE_RATE * duration_ms / 1000)
    samples = []

    for i in range(num_samples):
        t = i / SAMPLE_RATE  # Time in seconds
        t_ms = t * 1000       # Time in milliseconds

        sample = 0.0

        # --- Layer 1: Sharp initial transient (first 3ms) ---
        # This is the primary "click" - a burst of noise that decays very fast
        if t_ms < 3:
            envelope = (1.0 - t_ms / 3.0) ** 2
            # Mix of noise and a sharp impulse
            noise = random.uniform(-1, 1)
            impulse = math.sin(2 * math.pi * 2500 * t) * 0.6
            sample += (noise * 0.5 + impulse) * envelope * 0.9

        # --- Layer 2: Low-frequency thump (first 15ms) ---
        # Gives the click its "chunky" weight
        if t_ms < 15:
            envelope = (1.0 - t_ms / 15.0) ** 3
            thump = math.sin(2 * math.pi * 120 * t)
            thump += math.sin(2 * math.pi * 80 * t) * 0.5
            sample += thump * envelope * 0.7

        # --- Layer 3: Metallic resonance (5-40ms) ---
        # A ringing overtone like a typewriter lever hitting
        if 1 < t_ms < 40:
            onset = min(1.0, (t_ms - 1) / 2.0)
            decay = math.exp(-(t_ms - 1) / 8.0)
            envelope = onset * decay
            # Multiple harmonics for metallic character
            metal = math.sin(2 * math.pi * 3800 * t) * 0.4
            metal += math.sin(2 * math.pi * 5200 * t) * 0.2
            metal += math.sin(2 * math.pi * 7100 * t) * 0.1
            sample += metal * envelope * 0.35

        # --- Layer 4: Secondary click / mechanism settle (8-14ms) ---
        # A quieter secondary snap as the mechanism locks into place
        if 8 < t_ms < 14:
            env2 = ((t_ms - 8) / 2.0 if t_ms < 10 else (14 - t_ms) / 4.0)
            env2 = max(0, env2) ** 2
            noise2 = random.uniform(-1, 1)
            sample += noise2 * env2 * 0.25

        # --- Layer 5: Body resonance tail (10-60ms) ---
        # Very subtle low rumble as the housing absorbs the impact
        if 10 < t_ms < 60:
            tail_env = math.exp(-(t_ms - 10) / 15.0) * 0.15
            body = math.sin(2 * math.pi * 200 * t)
            body += math.sin(2 * math.pi * 350 * t) * 0.3
            sample += body * tail_env

        samples.append(sample)

    # Normalize to prevent clipping
    peak = max(abs(s) for s in samples)
    if peak > 0:
        samples = [s / peak * 0.85 for s in samples]

    # Apply a final gentle high-pass to remove any DC offset
    # Simple first-order high-pass
    filtered = []
    prev_in = 0
    prev_out = 0
    alpha = 0.98  # Cutoff ~140Hz high-pass
    for s in samples:
        out = alpha * (prev_out + s - prev_in)
        prev_in = s
        prev_out = out
        filtered.append(out)

    # Re-normalize after filtering
    peak = max(abs(s) for s in filtered)
    if peak > 0:
        filtered = [s / peak * 0.9 for s in filtered]

    # Write WAV file
    with wave.open(filename, 'w') as wav:
        wav.setnchannels(1)        # Mono
        wav.setsampwidth(2)        # 16-bit
        wav.setframerate(SAMPLE_RATE)
        for s in filtered:
            clamped = max(-1.0, min(1.0, s))
            wav.writeframes(struct.pack('<h', int(clamped * 32767)))

    print(f"Generated: {filename} ({len(filtered)} samples, {duration_ms}ms)")


def generate_bell(filename="ringer.wav"):
    """
    Generate a bell/ringer sound for when the horseshoe lands on the pole.
    A bright, celebratory bell ring.
    """
    duration_ms = 600
    num_samples = int(SAMPLE_RATE * duration_ms / 1000)
    samples = []

    for i in range(num_samples):
        t = i / SAMPLE_RATE
        t_ms = t * 1000

        sample = 0.0

        # Initial strike
        if t_ms < 5:
            env = (1.0 - t_ms / 5.0) ** 2
            sample += random.uniform(-1, 1) * env * 0.3

        # Bell harmonics with slow decay
        decay = math.exp(-t * 4.0)
        sample += math.sin(2 * math.pi * 880 * t) * 0.6 * decay
        sample += math.sin(2 * math.pi * 1760 * t) * 0.3 * decay * math.exp(-t * 2)
        sample += math.sin(2 * math.pi * 2640 * t) * 0.15 * decay * math.exp(-t * 3)
        sample += math.sin(2 * math.pi * 3520 * t) * 0.08 * decay * math.exp(-t * 5)

        # Slight inharmonicity for realism
        sample += math.sin(2 * math.pi * 910 * t) * 0.1 * decay

        samples.append(sample)

    # Normalize
    peak = max(abs(s) for s in samples)
    if peak > 0:
        samples = [s / peak * 0.85 for s in samples]

    with wave.open(filename, 'w') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        for s in samples:
            clamped = max(-1.0, min(1.0, s))
            wav.writeframes(struct.pack('<h', int(clamped * 32767)))

    print(f"Generated: {filename} ({len(samples)} samples, {duration_ms}ms)")


if __name__ == "__main__":
    generate_click("tick.wav")
    generate_bell("ringer.wav")
    print("\nDone! Sound files generated in current directory.")
