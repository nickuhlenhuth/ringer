// ============================================================
// Ringer — Flight Path (23 positions per player)
// ============================================================

const FlightPath = (() => {

    function mirrorX(pos) {
        return {
            x: CONFIG.WIDTH - pos.x,
            y: pos.y,
            rotation: pos.rotation !== undefined ? -pos.rotation : undefined
        };
    }

    function buildPositions(pathConfig) {
        const positions = [];
        const air = pathConfig.air; // hardcoded array of 15 {x, y} objects

        // Positions 0–14: hardcoded air arc (4 unique + 7 shared + 4 unique)
        for (let i = 0; i <= 14; i++) {
            const pt = air[i];
            const scale = CONFIG.FLIGHT_SCALE_MAX;
            const rotation = (i / 14) * 5 * Math.PI; // ~2.5 full rotations
            positions.push({ x: pt.x, y: pt.y, scale, rotation });
        }

        // Positions 15–21: sand pit
        for (let i = 15; i <= 21; i++) {
            const pit = pathConfig.pit[i];
            positions.push({
                x: pit.x,
                y: pit.y,
                scale: CONFIG.FLIGHT_SCALE_MAX,
                rotation: pit.rotation
            });
        }

        // Position 22: overshoot
        const os = pathConfig.overshoot;
        positions.push({
            x: os.x,
            y: os.y,
            scale: CONFIG.FLIGHT_SCALE_MAX * 0.9,
            rotation: os.rotation
        });

        return positions;
    }

    function buildP2Positions(p1Positions) {
        const p2Positions = [];

        // Positions 0–3: unique to P2 (mirrored from P1's 0–3)
        for (let i = 0; i <= 3; i++) {
            const m = mirrorX(p1Positions[i]);
            const rotation = (i / 14) * 5 * Math.PI;
            p2Positions.push({ x: m.x, y: m.y, scale: CONFIG.FLIGHT_SCALE_MAX, rotation });
        }

        // Positions 4–10: shared with P1 (reversed from P1's 10–4)
        for (let i = 10; i >= 4; i--) {
            const p1 = p1Positions[i];
            p2Positions.push({
                x: p1.x,
                y: p1.y,
                scale: p1.scale,
                rotation: -p1.rotation
            });
        }

        // Positions 11–14: unique to P2 (mirrored from P1's 11–14)
        for (let i = 11; i <= 14; i++) {
            const m = mirrorX(p1Positions[i]);
            const rotation = (i / 14) * 5 * Math.PI;
            p2Positions.push({ x: m.x, y: m.y, scale: CONFIG.FLIGHT_SCALE_MAX, rotation });
        }

        // Pit positions 15–21: mirrored from P1
        for (let i = 15; i <= 21; i++) {
            const orig = CONFIG.P1_PATH.pit[i];
            const m = mirrorX(orig);
            p2Positions.push({
                x: m.x,
                y: m.y,
                scale: CONFIG.FLIGHT_SCALE_MAX,
                rotation: m.rotation
            });
        }

        // Overshoot position 22
        const os = mirrorX(CONFIG.P1_PATH.overshoot);
        p2Positions.push({
            x: os.x,
            y: os.y,
            scale: CONFIG.FLIGHT_SCALE_MAX * 0.9,
            rotation: os.rotation
        });

        return p2Positions;
    }

    // Pre-compute both paths
    const p1Positions = buildPositions(CONFIG.P1_PATH);
    const p2Positions = buildP2Positions(p1Positions);
    const p2PolePos = mirrorX(CONFIG.P1_PATH.pole);

    return {
        getPosition(player, index) {
            const positions = player === 1 ? p1Positions : p2Positions;
            return positions[Math.min(index, positions.length - 1)];
        },

        getAllPositions(player) {
            return player === 1 ? p1Positions : p2Positions;
        },

        getPole(player) {
            return player === 1 ? CONFIG.P1_PATH.pole : p2PolePos;
        },

        getHome(player) {
            return player === 1 ? CONFIG.P1_HOME : CONFIG.P2_HOME;
        }
    };
})();
