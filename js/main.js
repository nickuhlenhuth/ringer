// ============================================================
// Ringer — Main Entry Point
// ============================================================

(function () {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = CONFIG.WIDTH;
    canvas.height = CONFIG.HEIGHT;

    // --- Scaling ---
    const monitorFrame = document.getElementById('monitor-frame');
    function resize() {
        // Account for bezel padding (32px sides, 28px top, 36px bottom) + stand (~58px)
        const frameW = CONFIG.WIDTH + 64;
        const frameH = CONFIG.HEIGHT + 64 + 58;
        const scaleX = window.innerWidth / frameW;
        const scaleY = window.innerHeight / frameH;
        const scale = Math.min(scaleX, scaleY, 1); // cap at 1x
        monitorFrame.style.transform = `scale(${scale})`;
    }
    window.addEventListener('resize', resize);
    resize();

    // --- Init ---
    ScoreTicker.init();

    // --- Start button ---
    document.getElementById('start-btn').addEventListener('click', () => {
        Sound.ensureContext();
        Game.startGame();
    });

    // --- Neon text helper ---
    function drawNeonText(text, x, y, fontSize, options = {}) {
        const { color = CONFIG.NEON_GREEN, align = 'center', dim = false } = options;
        ctx.save();
        ctx.font = `bold ${fontSize}px "Courier New", monospace`;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';

        if (dim) {
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);
        } else {
            // Outer glow
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);
            // Inner bright
            ctx.shadowBlur = 5;
            ctx.fillStyle = '#aaffaa';
            ctx.fillText(text, x, y);
        }
        ctx.restore();
    }

    // --- Ringer label with wide letter-spacing (stencil look) ---
    function drawRingerLabel(text, x, y, lit) {
        const fontSize = 20;
        const letterSpacing = 1;
        ctx.save();
        ctx.font = `${fontSize}px "Luckiest Guy", "Arial Black", "Impact", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Measure total width with letter spacing
        const chars = text.split('');
        let totalWidth = 0;
        chars.forEach((ch, i) => {
            totalWidth += ctx.measureText(ch).width;
            if (i < chars.length - 1) totalWidth += letterSpacing;
        });

        let curX = x - totalWidth / 2;

        if (lit) {
            ctx.shadowColor = CONFIG.NEON_GREEN;
            ctx.shadowBlur = 20;
            ctx.fillStyle = CONFIG.NEON_GREEN;
            chars.forEach((ch, i) => {
                const w = ctx.measureText(ch).width;
                ctx.fillText(ch, curX + w / 2, y);
                curX += w + (i < chars.length - 1 ? letterSpacing : 0);
            });
            // Inner bright pass
            curX = x - totalWidth / 2;
            ctx.shadowBlur = 5;
            ctx.fillStyle = '#aaffaa';
            chars.forEach((ch, i) => {
                const w = ctx.measureText(ch).width;
                ctx.fillText(ch, curX + w / 2, y);
                curX += w + (i < chars.length - 1 ? letterSpacing : 0);
            });
        } else {
            ctx.globalAlpha = 0.096;
            ctx.fillStyle = CONFIG.NEON_GREEN;
            chars.forEach((ch, i) => {
                const w = ctx.measureText(ch).width;
                ctx.fillText(ch, curX + w / 2, y);
                curX += w + (i < chars.length - 1 ? letterSpacing : 0);
            });
        }
        ctx.restore();
    }

    // --- Round counter (1–5 with active number lit, scooted left) ---
    function drawRoundCounter(currentRound) {
        const cy = CONFIG.TEXT.shotNumber.y;
        const fontSize = 80;
        const spacing = 70;
        const totalWidth = (CONFIG.TOTAL_ROUNDS - 1) * spacing;
        const startX = 529 - totalWidth / 2;

        for (let i = 1; i <= CONFIG.TOTAL_ROUNDS; i++) {
            const x = startX + (i - 1) * spacing;
            if (i === currentRound) {
                drawNeonText(String(i), x, cy, fontSize);
            } else {
                // Super faint placeholder
                ctx.save();
                ctx.globalAlpha = 0.096;
                ctx.font = `bold ${fontSize}px "Courier New", monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = CONFIG.NEON_GREEN;
                ctx.fillText(String(i), x, cy);
                ctx.restore();
            }
        }
    }

    // --- Render ---
    function render() {
        ctx.clearRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
        const gs = Game.getState();

        // Always show ghost paths for both players (including title screen)
        renderGhostArc();
        renderGhostEndpoints(1);
        renderGhostEndpoints(2);
        renderGhostPit(1);
        renderGhostPit(2);

        switch (gs.phase) {
            case 'TITLE':
                break;
            case 'PLAYER_AIM':
                renderAim(gs);
                break;
            case 'THROWING':
                renderThrowing(gs);
                break;
            case 'SCORING':
                renderScoring(gs);
                break;
            case 'TURN_END':
                break; // last throw result disappears on turn switch
            case 'GAME_OVER':
                break;
        }

        // Always show round counter and ghost text (including title screen)
        if (gs.phase !== 'GAME_OVER') {
            drawRoundCounter(gs.currentRound);
        }

        // Ghost text always visible; lit up on ringer
        const rx = CONFIG.TEXT.ringerScores.x;
        const ry = CONFIG.TEXT.ringerScores.y;
        const lit = gs.showRingerText;
        drawRingerLabel('RINGER  SCORES', rx, ry - 14, lit);
        drawRingerLabel('EXTRA  SHOT', rx, ry + 14, lit);

        // GAME OVER ghost text — lit when game is over
        const gx = CONFIG.TEXT.gameOver.x;
        const gy = CONFIG.TEXT.gameOver.y;
        const gameOverLit = gs.phase === 'GAME_OVER';
        drawRingerLabel('GAME', gx, gy - 14, gameOverLit);
        drawRingerLabel('OVER', gx, gy + 14, gameOverLit);
    }


    function renderAim(gs) {
        // Horseshoe lit up above current player's pole
        const home = FlightPath.getHome(gs.currentPlayer);
        Horseshoe.draw(ctx, home.x, home.y, 0, 1.0, {
            color: '#ffff00',
            glow: true
        });

        // Hold prompt
        drawNeonText('HOLD SPACE TO THROW', 20, 30, 14, { align: 'left', dim: true });

        // Power meter
        PowerMeter.draw(ctx);
    }

    // Draw shared middle arc ghosts (positions 4–10, drawn once)
    function renderGhostArc() {
        const allPositions = FlightPath.getAllPositions(1);
        for (let i = 4; i <= 10; i++) {
            const pos = allPositions[i];
            Horseshoe.draw(ctx, pos.x, pos.y, pos.rotation, pos.scale, {
                pointValue: 0,
                glow: false,
                dim: true
            });
        }
    }

    // Draw player-specific arc endpoints (positions 0–3 and 11–14)
    function renderGhostEndpoints(player) {
        const allPositions = FlightPath.getAllPositions(player);
        for (let i = 0; i <= 3; i++) {
            const pos = allPositions[i];
            Horseshoe.draw(ctx, pos.x, pos.y, pos.rotation, pos.scale, {
                pointValue: 0,
                glow: false,
                dim: true
            });
        }
        for (let i = 11; i <= 14; i++) {
            const pos = allPositions[i];
            Horseshoe.draw(ctx, pos.x, pos.y, pos.rotation, pos.scale, {
                pointValue: 0,
                glow: false,
                dim: true
            });
        }
    }

    // Draw player-specific pit ghosts (positions 15–22)
    function renderGhostPit(player) {
        const allPositions = FlightPath.getAllPositions(player);
        for (let i = 15; i < allPositions.length; i++) {
            const pos = allPositions[i];
            const score = CONFIG.SCORE[i] || 0;
            Horseshoe.draw(ctx, pos.x, pos.y, pos.rotation, pos.scale, {
                pointValue: score > 0 ? score : 0,
                glow: false,
                dim: true
            });
        }
    }

    function renderThrowing(gs) {
        const pos = FlightPath.getPosition(gs.currentPlayer, gs.currentTick);
        const score = CONFIG.SCORE[gs.currentTick] || 0;
        const inPit = gs.currentTick >= 15 && gs.currentTick <= 21;
        Horseshoe.draw(ctx, pos.x, pos.y, pos.rotation, pos.scale, {
            pointValue: score,
            color: inPit ? '#ffff00' : CONFIG.NEON_GREEN,
            glow: true
        });
    }

    function renderScoring(gs) {

        const pos = FlightPath.getPosition(gs.currentPlayer, gs.throwTarget);
        const isRinger = gs.throwTarget === CONFIG.RINGER_POSITION;
        const isPit = gs.throwTarget >= 15 && gs.throwTarget <= 21;
        const pulse = isRinger ? Math.sin(gs.pulsePhase) * 15 : 0;
        const score = CONFIG.SCORE[gs.throwTarget] || 0;
        const shotColor = isPit ? '#ffff00' : CONFIG.NEON_GREEN;

        Horseshoe.draw(ctx, pos.x, pos.y, pos.rotation, pos.scale, {
            pointValue: score,
            color: shotColor,
            glow: true,
            pulse: Math.abs(pulse)
        });


    }


    // --- Game Loop ---
    let lastTime = 0;

    function gameLoop(timestamp) {
        const dt = lastTime === 0 ? 16 : timestamp - lastTime;
        lastTime = timestamp;

        Game.update(dt);
        render();

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);

    // --- Input ---
    let spaceDown = false;

    document.addEventListener('keydown', (e) => {
        if (e.code !== 'Space' || e.repeat) return;
        e.preventDefault();

        Sound.ensureContext();
        const gs = Game.getState();

        if (gs.phase === 'PLAYER_AIM') {
            spaceDown = true;
            PowerMeter.start();
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code !== 'Space') return;
        e.preventDefault();

        const gs = Game.getState();

        if (gs.phase === 'PLAYER_AIM' && spaceDown) {
            spaceDown = false;
            const power = PowerMeter.stop();
            Game.executeThrow(power);
        }
    });
})();
