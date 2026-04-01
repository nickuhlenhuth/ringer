// ============================================================
// Ringer — Game Configuration Constants
// ============================================================

const CONFIG = {
    // Logical resolution (1920×1080, 16:9 monitor)
    WIDTH: 1920,
    HEIGHT: 1080,

    // Scoring by position (flat arrays indexed 0–22)
    SCORE: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 1,1,2,3,2,1,1, 0],
    NAMES: [
        'miss','miss','miss','miss','miss','miss','miss','miss',
        'miss','miss','miss','miss','miss','miss','miss',
        'inpit','inpit','leaner','ringer','leaner','inpit','inpit',
        'miss'
    ],

    // Game rules
    TOTAL_ROUNDS: 7,         // 7 throws each, alternating
    EXTRA_SHOT_ROUNDS: [3, 6, 7],  // rounds where ringer grants an extra shot
    RINGER_POSITION: 18,

    // Animation timing (ms per tick)
    TICK_BASE_DELAY: 500,    // ~2 ticks/sec
    TICK_SLOW: [
        { remaining: 3, delay: 600 },
        { remaining: 2, delay: 800 },
        { remaining: 1, delay: 1200 }
    ],
    SCORING_PAUSE: 3000,     // ms to show score before next turn (1s delay + flap animation)

    // Power meter
    POWER_FILL_RATE: 1.17,   // units per second (0→1 in ~0.85s)
    POWER_MAX: 1.0,

    // Power → position mapping thresholds
    POWER_MAP: {
        underthrowEnd: 0.60,   // 0–0.60 → positions 0–14
        pos15: 0.64,
        pos16: 0.68,
        pos17: 0.74,
        pos18: 0.78,           // ringer: narrow 4% band
        pos19: 0.84,
        pos20: 0.88,
        pos21: 0.92,
        // > 0.92 → position 22 (overshoot)
    },

    // Neon glow
    NEON_GREEN: '#39ff14',
    NEON_GLOW_BLUR: 15,
    NEON_GLOW_BLUR_STRONG: 30,

    // Horseshoe display styles
    GHOST_OPACITY: 0.04096,
    GHOST_COLOR: '#0a2a0e',
    ACTIVE_COLOR: '#44ff66',
    ACTIVE_GLOW_BLUR: 12,

    // Horseshoe dimensions (at scale 1.0, sized to straddle the pole)
    HORSESHOE: {
        radius: 40,
        prongLength: 48,
        lineWidth: 9,
        dotRadius: 6
    },

    // Player home positions (above own pole, where horseshoe sits before throw)
    P1_HOME: { x: 304, y: 582 },   // above left pit pole
    P2_HOME: { x: 1615, y: 582 },  // above right pit pole

    // --- Flight path: Player 1 throws left→right ---
    P1_PATH: {
        // Hardcoded air arc positions 0–14 (4 unique, 7 shared, 4 unique)
        // Shared section (4–10) is symmetric around x=960 for smooth P2 mirroring
        air: [
            { x: 304, y: 582 },   // 0  — home position (matches P1_HOME)
            { x: 401, y: 566 },   // 1  — rising from left
            { x: 505, y: 550 },   // 2  — rising towards fountain
            { x: 609, y: 521 },   // 3  — approaching shared zone (raised to avoid P2 overlap)
            { x: 697, y: 518 },   // 4  — enter shared  [mirror x: 1223]
            { x: 793, y: 517 },   // 5  — shared         [mirror x: 1127]
            { x: 890, y: 491 },   // 6  — shared         [mirror x: 1030]
            { x: 960, y: 487 },   // 7  — center apex    [mirror x: 960]
            { x: 1030, y: 491 },  // 8  — shared         [= mirror of pos 6]
            { x: 1127, y: 517 },  // 9  — shared         [= mirror of pos 5]
            { x: 1223, y: 518 },  // 10 — leave shared   [= mirror of pos 4]
            { x: 1311, y: 569 },  // 11 — descending (raised to avoid P1 overlap)
            { x: 1415, y: 609 },  // 12 — descending
            { x: 1498, y: 650 },  // 13 — approaching pit
            { x: 1535, y: 683 }   // 14 — pit entry
        ],
        // Sand pit positions 15–21 (right pit, pole ~1615,867)
        pit: {
            15: { x: 1535, y: 799, rotation: -0.3 },    // top-left corner (1pt)
            16: { x: 1535, y: 934, rotation: 0.3 },     // bottom-left corner (1pt)
            17: { x: 1555, y: 867, rotation: 1.2 },     // left of pole (2pt, spread wider)
            18: { x: 1622, y: 887, rotation: Math.PI },  // ON the pole — ringer (3pt)
            19: { x: 1692, y: 867, rotation: -1.2 },    // right of pole (2pt, spread wider)
            20: { x: 1696, y: 799, rotation: 0.3 },     // top-right corner (1pt)
            21: { x: 1696, y: 934, rotation: -0.3 }     // bottom-right corner (1pt)
        },
        // Overshoot position 22
        overshoot: { x: 1843, y: 920, rotation: 0.5 },
        // Pole center (for ringer visual)
        pole: { x: 1615, y: 867 }
    },

    // Player 2 path is mirrored (computed at runtime in flightpath.js)

    // Scale along flight path (perspective: smaller at arc peak)
    FLIGHT_SCALE_MIN: 0.855,   // at arc peak
    FLIGHT_SCALE_MAX: 1.9,    // at sand pit

    // Text positions (y scaled by 1.3534 from original)
    TEXT: {
        shotInPlay: { x: 274, y: 1014 },
        ringerScores: { x: 770, y: 920 },
        shotNumber: { x: 960, y: 1015 },
        roundInfo: { x: 960, y: 979 },
        gameOver: { x: 1218, y: 1015 }
    },

    // Score ticker positions (on tree silhouettes)
    TICKER: {
        p1: { x: 203, y: 69 },
        p2: { x: 1564, y: 69 }
    }
};
