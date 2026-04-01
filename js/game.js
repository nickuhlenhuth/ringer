// ============================================================
// Ringer — Game State Machine
// ============================================================

const Game = (() => {
    const state = {
        phase: 'TITLE',       // TITLE, PLAYER_AIM, THROWING, SCORING, TURN_END, GAME_OVER
        currentPlayer: 1,
        scores: [0, 0],
        currentRound: 1,
        totalThrows: 0,       // total throws made across both players
        throwTarget: 0,       // target position (0–22)
        currentTick: 0,       // current position during animation
        tickTimer: 0,         // ms accumulator for tick timing
        scoringTimer: 0,      // ms accumulator for scoring pause
        turnEndTimer: 0,
        ringerBonus: false,   // extra shot from ringer (only on extra-shot rounds)
        showRingerText: false, // derived from currentRound in getState()
        lastScore: 0,         // points from the last throw
        gameOverTimer: 0,
        pulsePhase: 0         // for ringer glow pulse
    };

    function reset() {
        state.phase = 'TITLE';
        state.currentPlayer = 1;
        state.scores = [0, 0];
        state.currentRound = 1;
        state.totalThrows = 0;
        state.throwTarget = 0;
        state.currentTick = 0;
        state.ringerBonus = false;
        state.lastScore = 0;
        ScoreTicker.reset();
    }

    function startGame() {
        reset();
        state.phase = 'PLAYER_AIM';
        PowerMeter.reset();
        SpinnerWheel.reset();
    }

    function executeThrow(power) {
        state.throwTarget = Math.max(1, PowerMeter.powerToPosition(power));
        state.currentTick = 1;
        state.tickTimer = 0;
        state.phase = 'THROWING';
        state.lastScore = 0;
        PowerMeter.reset();
        SpinnerWheel.reset();
        Sound.playTick();
    }

    function getTickDelay() {
        const remaining = state.throwTarget - state.currentTick;
        for (const slow of CONFIG.TICK_SLOW) {
            if (remaining <= slow.remaining) return slow.delay;
        }
        return CONFIG.TICK_BASE_DELAY;
    }

    function updateThrowing(dt) {
        state.tickTimer += dt;
        const delay = getTickDelay();

        if (state.tickTimer >= delay) {
            state.tickTimer -= delay;
            state.currentTick++;

            if (state.currentTick >= state.throwTarget) {
                // Reached target
                state.currentTick = state.throwTarget;
                const score = CONFIG.SCORE[state.throwTarget] || 0;
                state.lastScore = score;

                if (state.throwTarget === CONFIG.RINGER_POSITION) {
                    Sound.playRinger();
                    // Extra shot only on extra-shot-eligible rounds
                    if (CONFIG.EXTRA_SHOT_ROUNDS.includes(state.currentRound)) {
                        state.ringerBonus = true;
                    }
                } else if (score > 0) {
                    Sound.playPoints();
                } else {
                    Sound.playTick();
                }

                if (score > 0) {
                    state.scores[state.currentPlayer - 1] += score;
                    // 1-second delay before the ticker starts flipping
                    const p = state.currentPlayer;
                    const s = state.scores[p - 1];
                    setTimeout(() => ScoreTicker.setScore(p, s), 1000);
                }

                state.scoringTimer = 0;
                state.phase = 'SCORING';
            } else {
                Sound.playTick();
            }
        }
    }

    function updateScoring(dt) {
        state.scoringTimer += dt;
        state.pulsePhase += dt * 0.008;

        if (state.scoringTimer >= CONFIG.SCORING_PAUSE) {
            state.phase = 'TURN_END';
            state.turnEndTimer = 0;
        }
    }

    function updateTurnEnd(dt) {
        state.turnEndTimer += dt;
        if (state.turnEndTimer < 300) return; // brief pause

        state.totalThrows++;

        // Check game over: each player gets TOTAL_ROUNDS throws
        const p1Throws = Math.ceil(state.totalThrows / 2);
        const p2Throws = Math.floor(state.totalThrows / 2);

        if (state.ringerBonus) {
            // Same player gets another throw (doesn't count against total)
            state.totalThrows--;
            state.ringerBonus = false;
        } else {
            // Switch players
            state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
        }

        // Update round number (each pair of throws = 1 round)
        state.currentRound = Math.floor(state.totalThrows / 2) + 1;

        if (p1Throws >= CONFIG.TOTAL_ROUNDS && p2Throws >= CONFIG.TOTAL_ROUNDS) {
            state.phase = 'GAME_OVER';
            state.gameOverTimer = 0;
            return;
        }

        state.phase = 'PLAYER_AIM';
        state.pulsePhase = 0;
        PowerMeter.reset();
        SpinnerWheel.reset();
    }

    function update(dt) {
        switch (state.phase) {
            case 'PLAYER_AIM':
                PowerMeter.update(dt);
                SpinnerWheel.update(dt);
                break;
            case 'THROWING':
                SpinnerWheel.update(dt);
                updateThrowing(dt);
                break;
            case 'SCORING':
                SpinnerWheel.update(dt);
                updateScoring(dt);
                break;
            case 'TURN_END':
                updateTurnEnd(dt);
                break;
            case 'GAME_OVER':
                state.gameOverTimer += dt;
                break;
        }
    }

    function getState() {
        // "RINGER SCORES EXTRA SHOT" lights up during extra-shot-eligible rounds
        state.showRingerText = CONFIG.EXTRA_SHOT_ROUNDS.includes(state.currentRound)
            && state.phase !== 'TITLE' && state.phase !== 'GAME_OVER';
        return state;
    }

    return { reset, startGame, executeThrow, update, getState };
})();
