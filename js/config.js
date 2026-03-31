// ============================================================
// Ringer — Game Configuration Constants
// ============================================================

const CONFIG = {
    // Logical resolution (matches background image)
    WIDTH: 1198,
    HEIGHT: 798,

    // Scoring by position (flat arrays indexed 0–22)
    SCORE: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 1,1,2,3,2,1,1, 0],
    NAMES: [
        'miss','miss','miss','miss','miss','miss','miss','miss',
        'miss','miss','miss','miss','miss','miss','miss',
        'inpit','inpit','leaner','ringer','leaner','inpit','inpit',
        'miss'
    ],

    // Game rules
    TOTAL_ROUNDS: 5,         // 5 throws each, alternating
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
    POWER_FILL_RATE: 0.6,    // units per second (0→1 in ~1.7s)
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
    GHOST_OPACITY: 0.064,
    GHOST_COLOR: '#0a2a0e',
    ACTIVE_COLOR: '#44ff66',
    ACTIVE_GLOW_BLUR: 12,

    // Horseshoe dimensions (at scale 1.0)
    HORSESHOE: {
        radius: 18,
        prongLength: 22,
        lineWidth: 5,
        dotRadius: 3
    },

    // Player home positions (above own pole, where horseshoe sits before throw)
    P1_HOME: { x: 190, y: 430 },   // above left pit pole
    P2_HOME: { x: 1008, y: 430 },  // above right pit pole

    // --- Flight path: Player 1 throws left→right ---
    P1_PATH: {
        // Hardcoded air arc positions 0–14 (4 unique, 7 shared, 4 unique)
        // Shared section (4–10) is symmetric around x=599 for smooth P2 mirroring
        air: [
            { x: 190, y: 430 },   // 0  — home position (matches P1_HOME)
            { x: 250, y: 418 },   // 1  — rising from left
            { x: 315, y: 406 },   // 2  — rising towards fountain
            { x: 380, y: 392 },   // 3  — approaching shared zone
            { x: 435, y: 388 },   // 4  — enter shared  [mirror x: 763]
            { x: 495, y: 382 },   // 5  — shared         [mirror x: 703]
            { x: 555, y: 363 },   // 6  — shared         [mirror x: 643]
            { x: 599, y: 360 },   // 7  — center apex    [mirror x: 599]
            { x: 643, y: 363 },   // 8  — shared         [= mirror of pos 6]
            { x: 703, y: 382 },   // 9  — shared         [= mirror of pos 5]
            { x: 763, y: 388 },   // 10 — leave shared   [= mirror of pos 4]
            { x: 818, y: 428 },   // 11 — descending (steeper to avoid P2's start path)
            { x: 883, y: 450 },   // 12 — descending
            { x: 935, y: 480 },   // 13 — approaching pit
            { x: 958, y: 505 }    // 14 — pit entry
        ],
        // Sand pit positions 15–21 (right pit, pole ~1008,640)
        pit: {
            15: { x: 958, y: 590, rotation: -0.3 },    // top-left corner (1pt)
            16: { x: 958, y: 690, rotation: 0.3 },     // bottom-left corner (1pt)
            17: { x: 983, y: 640, rotation: 1.2 },     // left of pole (2pt)
            18: { x: 1012, y: 655, rotation: Math.PI }, // ON the pole — ringer (3pt)
            19: { x: 1043, y: 640, rotation: -1.2 },   // right of pole (2pt)
            20: { x: 1058, y: 590, rotation: 0.3 },    // top-right corner (1pt)
            21: { x: 1058, y: 690, rotation: -0.3 }    // bottom-right corner (1pt)
        },
        // Overshoot position 22
        overshoot: { x: 1150, y: 680, rotation: 0.5 },
        // Pole center (for ringer visual)
        pole: { x: 1008, y: 640 }
    },

    // Player 2 path is mirrored (computed at runtime in flightpath.js)

    // Scale along flight path (perspective: smaller at arc peak)
    FLIGHT_SCALE_MIN: 0.45,   // at arc peak
    FLIGHT_SCALE_MAX: 1.0,    // at sand pit

    // Text positions
    TEXT: {
        shotInPlay: { x: 171, y: 749 },
        ringerScores: { x: 545, y: 680 },
        shotNumber: { x: 599, y: 750 },
        roundInfo: { x: 599, y: 723 },
        gameOver: { x: 760, y: 750 }
    },

    // Score ticker positions (on tree silhouettes)
    TICKER: {
        p1: { x: 127, y: 51 },
        p2: { x: 976, y: 51 }
    }
};
