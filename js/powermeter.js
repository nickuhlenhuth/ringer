// ============================================================
// Ringer — Power Meter (Press-and-Hold)
// ============================================================

const PowerMeter = (() => {
    let value = 0;
    let active = false;

    function start() {
        value = 0;
        active = true;
    }

    function stop() {
        active = false;
        return value;
    }

    function update(dt) {
        if (!active) return;
        value += CONFIG.POWER_FILL_RATE * (dt / 1000);
        if (value >= CONFIG.POWER_MAX) {
            value = CONFIG.POWER_MAX;
        }
    }

    function reset() {
        value = 0;
        active = false;
    }

    function isActive() { return active; }
    function getValue() { return value; }

    function powerToPosition(power) {
        const pm = CONFIG.POWER_MAP;
        if (power < pm.underthrowEnd) {
            return Math.floor((power / pm.underthrowEnd) * 15);
        }
        if (power < pm.pos15) return 15;
        if (power < pm.pos16) return 16;
        if (power < pm.pos17) return 17;
        if (power < pm.pos18) return 18;
        if (power < pm.pos19) return 19;
        if (power < pm.pos20) return 20;
        if (power < pm.pos21) return 21;
        return 22;
    }

    function draw(ctx, lit) {
        const barX = 32;
        const barY = 80;
        const barW = 48;
        const barH = 224;
        const pad = 4;

        ctx.save();

        const baseAlpha = lit ? 1.0 : 0.15;
        ctx.globalAlpha = baseAlpha;

        // Outer border — neon green outline
        ctx.strokeStyle = CONFIG.NEON_GREEN;
        ctx.lineWidth = 2;
        if (lit) {
            ctx.shadowColor = CONFIG.NEON_GREEN;
            ctx.shadowBlur = 12;
        }
        ctx.strokeRect(barX - pad, barY - pad, barW + pad * 2, barH + pad * 2);
        ctx.shadowBlur = 0;

        // Dark interior
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(barX, barY, barW, barH);

        // Zone coloring (bottom to top)
        const pm = CONFIG.POWER_MAP;
        const zones = [
            { start: 0, end: pm.underthrowEnd, color: '#330808' },
            { start: pm.underthrowEnd, end: 0.92, color: '#082208' },
            { start: 0.92, end: 1.0, color: '#330808' }
        ];

        for (const zone of zones) {
            const zy = barY + barH - (zone.end * barH);
            const zh = (zone.end - zone.start) * barH;
            ctx.fillStyle = zone.color;
            ctx.fillRect(barX, zy, barW, zh);
        }

        // Ringer sweet spot — brighter green band
        const ringerStart = pm.pos17;
        const ringerEnd = pm.pos18;
        const ry = barY + barH - (ringerEnd * barH);
        const rh = (ringerEnd - ringerStart) * barH;
        ctx.fillStyle = lit ? '#1a4a1a' : '#0d250d';
        ctx.fillRect(barX, ry, barW, rh);

        // Zone divider lines — faint neon ticks
        const dividers = [pm.underthrowEnd, 0.92];
        ctx.strokeStyle = CONFIG.NEON_GREEN;
        ctx.globalAlpha = baseAlpha * 0.3;
        ctx.lineWidth = 1;
        for (const d of dividers) {
            const dy = barY + barH - (d * barH);
            ctx.beginPath();
            ctx.moveTo(barX, dy);
            ctx.lineTo(barX + barW, dy);
            ctx.stroke();
        }
        ctx.globalAlpha = baseAlpha;

        // Fill level (only when active or has value)
        if (active || value > 0) {
            const fillH = value * barH;
            const fillY = barY + barH - fillH;

            // Neon fill glow
            ctx.shadowColor = CONFIG.NEON_GREEN;
            ctx.shadowBlur = 15;
            ctx.fillStyle = CONFIG.NEON_GREEN;
            ctx.globalAlpha = 0.25;
            ctx.fillRect(barX, fillY, barW, fillH);
            ctx.globalAlpha = 1.0;

            // Bright indicator line
            ctx.strokeStyle = CONFIG.NEON_GREEN;
            ctx.shadowBlur = 20;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(barX - 8, fillY);
            ctx.lineTo(barX + barW + 8, fillY);
            ctx.stroke();

            // Inner bright core line
            ctx.strokeStyle = '#aaffaa';
            ctx.shadowBlur = 5;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(barX - 6, fillY);
            ctx.lineTo(barX + barW + 6, fillY);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Label — neon style
        ctx.globalAlpha = baseAlpha;
        if (lit) {
            ctx.shadowColor = CONFIG.NEON_GREEN;
            ctx.shadowBlur = 10;
        }
        ctx.fillStyle = CONFIG.NEON_GREEN;
        ctx.font = '16px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('POWER', barX + barW / 2, barY + barH + 20);

        // Inner bright text pass
        if (lit) {
            ctx.shadowBlur = 3;
            ctx.fillStyle = '#aaffaa';
            ctx.fillText('POWER', barX + barW / 2, barY + barH + 20);
        }

        ctx.restore();
    }

    return { start, stop, update, reset, draw, isActive, getValue, powerToPosition };
})();
