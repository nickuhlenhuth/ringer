// ============================================================
// Ringer — Spinner Wheel (Flick-to-Spin Power Input)
// ============================================================

const SpinnerWheel = (() => {
    const cfg = () => CONFIG.SPINNER;

    let angle = 0;            // current visual rotation (radians)
    let angularVelocity = 0;  // rad/s
    let phase = 'IDLE';       // IDLE | DRAGGING | SPINNING
    let dragHistory = [];      // [{angle, time}] last 5 samples
    let lastPointerAngle = 0;
    let power = 0;

    function pointerAngle(x, y) {
        return Math.atan2(y - cfg().CENTER_Y, x - cfg().CENTER_X);
    }

    function normalizeAngle(a) {
        while (a > Math.PI) a -= 2 * Math.PI;
        while (a < -Math.PI) a += 2 * Math.PI;
        return a;
    }

    function handlePointerDown(x, y) {
        const dx = x - cfg().CENTER_X;
        const dy = y - cfg().CENTER_Y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > cfg().HIT_RADIUS) return false;

        phase = 'DRAGGING';
        angularVelocity = 0;
        lastPointerAngle = pointerAngle(x, y);
        dragHistory = [{ angle: lastPointerAngle, time: performance.now() }];
        return true;
    }

    function handlePointerMove(x, y) {
        if (phase !== 'DRAGGING') return;

        const pa = pointerAngle(x, y);
        const delta = normalizeAngle(pa - lastPointerAngle);
        angle += delta;
        lastPointerAngle = pa;

        dragHistory.push({ angle: pa, time: performance.now() });
        if (dragHistory.length > 5) dragHistory.shift();
    }

    function handlePointerUp() {
        if (phase !== 'DRAGGING') return { power: 0, didSpin: false };

        // Compute flick velocity from last two drag samples
        let velocity = 0;
        if (dragHistory.length >= 2) {
            const a = dragHistory[dragHistory.length - 2];
            const b = dragHistory[dragHistory.length - 1];
            const dt = (b.time - a.time) / 1000;
            if (dt > 0.001) {
                velocity = normalizeAngle(b.angle - a.angle) / dt;
            }
        }

        angularVelocity = velocity;
        const absVel = Math.abs(velocity);
        power = Math.min(1.0, absVel / cfg().MAX_VELOCITY);

        const didSpin = absVel > 1.0; // minimum threshold to count as a spin
        phase = didSpin ? 'SPINNING' : 'IDLE';
        dragHistory = [];

        return { power, didSpin };
    }

    function update(dt) {
        if (phase !== 'SPINNING') return;

        const dtSec = dt / 1000;
        // Apply friction to decelerate
        if (angularVelocity > 0) {
            angularVelocity = Math.max(0, angularVelocity - cfg().FRICTION * dtSec);
        } else {
            angularVelocity = Math.min(0, angularVelocity + cfg().FRICTION * dtSec);
        }
        angle += angularVelocity * dtSec;

        if (Math.abs(angularVelocity) < 0.05) {
            angularVelocity = 0;
            phase = 'IDLE';
        }
    }

    function draw(ctx, lit) {
        const cx = cfg().CENTER_X;
        const cy = cfg().CENTER_Y;
        const r = cfg().RADIUS;
        const segments = cfg().SEGMENTS;

        ctx.save();

        const baseAlpha = lit ? 1.0 : 0.15;
        ctx.globalAlpha = baseAlpha;

        // Outer circle ring
        ctx.strokeStyle = CONFIG.NEON_GREEN;
        ctx.lineWidth = 3;
        if (lit) {
            ctx.shadowColor = CONFIG.NEON_GREEN;
            ctx.shadowBlur = 14;
        }
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Inner bright ring pass
        if (lit) {
            ctx.strokeStyle = '#aaffaa';
            ctx.lineWidth = 1;
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Spokes
        for (let i = 0; i < segments; i++) {
            const a = angle + (i / segments) * Math.PI * 2;
            const x1 = cx + Math.cos(a) * 12;
            const y1 = cy + Math.sin(a) * 12;
            const x2 = cx + Math.cos(a) * (r - 6);
            const y2 = cy + Math.sin(a) * (r - 6);

            const isMarker = i === 0;

            ctx.strokeStyle = isMarker ? '#ffff44' : CONFIG.NEON_GREEN;
            ctx.lineWidth = isMarker ? 4 : 2;
            if (lit) {
                ctx.shadowColor = isMarker ? '#ffff44' : CONFIG.NEON_GREEN;
                ctx.shadowBlur = isMarker ? 16 : 10;
            }
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            // Bright inner pass for marker spoke
            if (isMarker && lit) {
                ctx.strokeStyle = '#ffffaa';
                ctx.lineWidth = 1.5;
                ctx.shadowBlur = 3;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }
        ctx.shadowBlur = 0;

        // Center dot
        ctx.fillStyle = lit ? CONFIG.NEON_GREEN : '#0a2a0e';
        if (lit) {
            ctx.shadowColor = CONFIG.NEON_GREEN;
            ctx.shadowBlur = 8;
        }
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.globalAlpha = baseAlpha;
        if (lit) {
            ctx.shadowColor = CONFIG.NEON_GREEN;
            ctx.shadowBlur = 10;
        }
        ctx.fillStyle = CONFIG.NEON_GREEN;
        ctx.font = '16px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SPIN', cx, cy + r + 20);

        if (lit) {
            ctx.shadowBlur = 3;
            ctx.fillStyle = '#aaffaa';
            ctx.fillText('SPIN', cx, cy + r + 20);
        }

        ctx.restore();
    }

    function reset() {
        angle = 0;
        angularVelocity = 0;
        phase = 'IDLE';
        dragHistory = [];
        power = 0;
    }

    function isIdle() { return phase === 'IDLE'; }
    function isSpinning() { return phase === 'SPINNING'; }
    function isDragging() { return phase === 'DRAGGING'; }
    function getPower() { return power; }

    return {
        handlePointerDown, handlePointerMove, handlePointerUp,
        update, draw, reset,
        isIdle, isSpinning, isDragging, getPower
    };
})();
