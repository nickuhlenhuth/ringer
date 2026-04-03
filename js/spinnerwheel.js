// ============================================================
// Ringer — Spinner Wheel (USB Spinner — Mouse X-Axis Input)
// ============================================================

const SpinnerWheel = (() => {
    const cfg = () => CONFIG.USB_SPINNER;

    let state = 'IDLE';           // IDLE | SPINNING | THROWN
    let peakAbsDx = 0;            // highest |movementX| seen during spin
    let throwTime = 0;            // timestamp of last throw (for cooldown)
    let power = 0;                // calculated throw power (0-1)

    // Feed raw movementX from each mousemove event
    function handleMovementX(dx, timestamp) {
        if (state === 'THROWN') {
            if (timestamp - throwTime < cfg().COOLDOWN) return null;
            state = 'IDLE';
            peakAbsDx = 0;
        }

        const absDx = Math.abs(dx);

        if (state === 'IDLE') {
            // Start tracking once a single movementX exceeds the threshold
            if (absDx >= cfg().MIN_DX) {
                state = 'SPINNING';
                peakAbsDx = absDx;
            }
            return null;
        }

        if (state === 'SPINNING') {
            if (absDx >= peakAbsDx) {
                // Still accelerating — update peak
                peakAbsDx = absDx;
                return null;
            }

            // Velocity decreased from peak — fire the throw
            const rawPower = peakAbsDx / cfg().MAX_DX;
            power = Math.min(1.0, rawPower);
            state = 'THROWN';
            throwTime = timestamp;
            const result = { power, rawPower, didSpin: true };
            peakAbsDx = 0;
            return result;
        }

        return null;
    }

    function reset() {
        state = 'IDLE';
        peakAbsDx = 0;
        power = 0;
    }

    function getSpinState() {
        return { state, peakAbsDx };
    }

    function isIdle() { return state === 'IDLE'; }
    function getPower() { return power; }

    return {
        handleMovementX, reset, getSpinState,
        isIdle, getPower
    };
})();
