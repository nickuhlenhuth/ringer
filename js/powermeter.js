// ============================================================
// Ringer — Power Meter (Press-and-Hold)
// ============================================================

const PowerMeter = (() => {
    let value = 0;
    let active = false;
    let visible = false;

    function show() {
        value = 0;
        active = false;
        visible = true;
    }

    function start() {
        value = 0;
        active = true;
        visible = true;
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

    function hide() {
        visible = false;
        value = 0;
        active = false;
    }

    function isActive() { return active; }
    function isVisible() { return visible; }
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

    function draw(ctx) {
        if (!visible) return;

        const barX = 20;
        const barY = 50;
        const barW = 30;
        const barH = 140;

        // Background
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#111';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.fillRect(barX - 4, barY - 4, barW + 8, barH + 8);
        ctx.strokeRect(barX - 4, barY - 4, barW + 8, barH + 8);
        ctx.globalAlpha = 1.0;

        // Zone coloring (bottom to top: red-miss, green-scoring, red-overshoot)
        const pm = CONFIG.POWER_MAP;
        const zones = [
            { start: 0, end: pm.underthrowEnd, color: '#661111' },
            { start: pm.underthrowEnd, end: 0.92, color: '#116611' },
            { start: 0.92, end: 1.0, color: '#661111' }
        ];

        for (const zone of zones) {
            const zy = barY + barH - (zone.end * barH);
            const zh = (zone.end - zone.start) * barH;
            ctx.fillStyle = zone.color;
            ctx.fillRect(barX, zy, barW, zh);
        }

        // Ringer sweet spot highlight
        const ringerStart = pm.pos17;
        const ringerEnd = pm.pos18;
        const ry = barY + barH - (ringerEnd * barH);
        const rh = (ringerEnd - ringerStart) * barH;
        ctx.fillStyle = '#228822';
        ctx.fillRect(barX, ry, barW, rh);

        // Fill level
        if (active || value > 0) {
            const fillH = value * barH;
            const fillY = barY + barH - fillH;

            ctx.shadowColor = CONFIG.NEON_GREEN;
            ctx.shadowBlur = 10;
            ctx.fillStyle = CONFIG.NEON_GREEN;
            ctx.globalAlpha = 0.35;
            ctx.fillRect(barX, fillY, barW, fillH);
            ctx.globalAlpha = 1.0;

            // Indicator line
            ctx.strokeStyle = CONFIG.NEON_GREEN;
            ctx.shadowBlur = 15;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(barX - 6, fillY);
            ctx.lineTo(barX + barW + 6, fillY);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Label
        ctx.fillStyle = '#888';
        ctx.font = '11px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('POWER', barX + barW / 2, barY + barH + 18);

        ctx.restore();
    }

    return { show, start, stop, update, hide, draw, isActive, isVisible, getValue, powerToPosition };
})();
