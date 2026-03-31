// ============================================================
// Ringer — Horseshoe Rendering
// ============================================================

const Horseshoe = (() => {

    function draw(ctx, x, y, rotation, scale, options = {}) {
        const {
            pointValue = 0,
            glow = true,
            color = CONFIG.ACTIVE_COLOR,
            pulse = 0,
            dim = false
        } = options;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);

        const opacity = dim ? CONFIG.GHOST_OPACITY : 1.0;
        const strokeColor = dim ? CONFIG.GHOST_COLOR : color;

        ctx.globalAlpha = opacity;

        // Helper to trace the horseshoe U-shape path
        function traceU(ctx) {
            ctx.beginPath();
            ctx.moveTo(-10, 8);
            ctx.bezierCurveTo(-10, -5, -5, -11, 0, -11);
            ctx.bezierCurveTo(5, -11, 10, -5, 10, 8);
        }

        // Sample a point along the horseshoe U bezier at parameter t (0–1)
        function sampleU(t) {
            // The U is two cubics: left half (t 0–0.5) and right half (t 0.5–1)
            if (t <= 0.5) {
                const s = t * 2; // 0–1 within first curve
                const x = bezier(s, -10, -10, -5, 0);
                const y = bezier(s, 8, -5, -11, -11);
                return { x, y };
            } else {
                const s = (t - 0.5) * 2; // 0–1 within second curve
                const x = bezier(s, 0, 5, 10, 10);
                const y = bezier(s, -11, -11, -5, 8);
                return { x, y };
            }
        }

        function bezier(t, p0, p1, p2, p3) {
            const mt = 1 - t;
            return mt*mt*mt*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t*t*t*p3;
        }

        // Draw nail-hole studs along the U-shape
        function drawStuds(ctx, style) {
            const studTs = [0.08, 0.25, 0.42, 0.58, 0.75, 0.92];
            ctx.fillStyle = style;
            for (const t of studTs) {
                const pt = sampleU(t);
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 1.0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Helper to draw both tip circles
        function drawTips(ctx, style) {
            ctx.fillStyle = style;
            ctx.beginPath();
            ctx.arc(-10, 8, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(10, 8, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // LED effect: outer glow halo
        if (glow && !dim) {
            ctx.save();
            ctx.globalAlpha = opacity * 0.25;
            ctx.shadowColor = color;
            ctx.shadowBlur = (CONFIG.ACTIVE_GLOW_BLUR + pulse) * 1.8;
            ctx.strokeStyle = color;
            ctx.lineWidth = 10;
            ctx.lineCap = 'round';
            traceU(ctx);
            ctx.stroke();
            drawTips(ctx, color);
            ctx.restore();
        }

        // LED effect: main color stroke with glow
        ctx.save();
        if (glow && !dim) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 20 + pulse;
        } else {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        }
        traceU(ctx);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();

        // LED effect: inner bright core (lighter center like neon text)
        if (glow && !dim) {
            const coreColor = color === '#ffff00' ? '#ffffaa' : '#aaffaa';
            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = 5;
            traceU(ctx);
            ctx.strokeStyle = coreColor;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.restore();

            // Bright core on tips
            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = 5;
            drawTips(ctx, coreColor);
            ctx.restore();
        }

        // Main tip circles
        ctx.save();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        drawTips(ctx, strokeColor);
        ctx.restore();

        // Unlit nail-hole studs (darker than the stroke)
        ctx.save();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.globalAlpha = dim ? opacity * 0.5 : opacity * 0.35;
        drawStuds(ctx, '#000000');
        ctx.restore();

        // Point value text inside the U (counter-rotate if horseshoe is flipped)
        if (pointValue > 0) {
            ctx.shadowColor = color;
            ctx.shadowBlur = glow && !dim ? 12 + pulse * 0.5 : 0;
            ctx.fillStyle = strokeColor;
            ctx.font = "bold 9px 'Press Start 2P', monospace";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const flipped = Math.abs(Math.abs(rotation) - Math.PI) < 0.01;
            if (flipped) {
                ctx.save();
                ctx.rotate(Math.PI);
                ctx.fillText(pointValue, 0, -4);
                ctx.restore();
            } else {
                ctx.fillText(pointValue, 0, 4);
            }
        }

        ctx.restore();
    }

    return { draw };
})();
