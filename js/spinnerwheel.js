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

    function draw(ctx) {
        const cx = cfg().CENTER_X;
        const cy = cfg().CENTER_Y;
        const r = cfg().RADIUS;
        const segments = cfg().SEGMENTS;
        const s = r / 70;

        // Metallic color palette
        const metalDark = '#707880';
        const metalMid = '#9aa4ae';
        const metalLight = '#c8d0d8';
        const metalHighlight = '#e0e6ec';
        const markerColor = '#b8860b'; // dark gold marker spoke

        ctx.save();

        // Outer rim — thick metallic ring
        ctx.strokeStyle = metalMid;
        ctx.lineWidth = 6 * s;
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 6 * s;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Inner highlight ring for bevel effect
        ctx.shadowBlur = 0;
        ctx.strokeStyle = metalHighlight;
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.arc(cx, cy, r - 3 * s, 0, Math.PI * 2);
        ctx.stroke();

        // Inner dark edge
        ctx.strokeStyle = metalDark;
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 2 * s, 0, Math.PI * 2);
        ctx.stroke();

        // Solid metallic face fill
        const faceGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r);
        faceGrad.addColorStop(0, metalHighlight);
        faceGrad.addColorStop(0.6, metalLight);
        faceGrad.addColorStop(1, metalMid);
        ctx.fillStyle = faceGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r - 3 * s, 0, Math.PI * 2);
        ctx.fill();

        // Spokes
        const spokeInner = 14 * s;
        const spokeOuter = r - 8 * s;
        for (let i = 0; i < segments; i++) {
            const a = angle + (i / segments) * Math.PI * 2;
            const x1 = cx + Math.cos(a) * spokeInner;
            const y1 = cy + Math.sin(a) * spokeInner;
            const x2 = cx + Math.cos(a) * spokeOuter;
            const y2 = cy + Math.sin(a) * spokeOuter;

            const isMarker = i === 0;

            // Main spoke
            ctx.strokeStyle = isMarker ? markerColor : metalMid;
            ctx.lineWidth = (isMarker ? 5 : 3) * s;
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 2 * s;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            // Highlight pass on each spoke
            ctx.shadowBlur = 0;
            ctx.strokeStyle = isMarker ? '#d4a82a' : metalLight;
            ctx.lineWidth = (isMarker ? 2 : 1) * s;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Center hub — metallic circle
        const hubRadius = 10 * s;
        const hubGrad = ctx.createRadialGradient(cx - 2 * s, cy - 2 * s, 0, cx, cy, hubRadius);
        hubGrad.addColorStop(0, metalHighlight);
        hubGrad.addColorStop(0.5, metalMid);
        hubGrad.addColorStop(1, metalDark);
        ctx.fillStyle = hubGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, hubRadius, 0, Math.PI * 2);
        ctx.fill();

        // Hub ring
        ctx.strokeStyle = metalDark;
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.arc(cx, cy, hubRadius, 0, Math.PI * 2);
        ctx.stroke();


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
