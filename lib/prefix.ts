const GG_TIMEOUT_MS = 500;

/** Tracks the `gg` key sequence (the only multi-key prefix this extension currently supports). */
export class PrefixTracker {
    private waitingForSecondG = false;
    private timer: ReturnType<typeof setTimeout> | null = null;

    /** Returns true once `g` has been pressed twice in a row within the timeout window. */
    consume(key: string): boolean {
        if (key !== 'g') {
            this.reset();
            return false;
        }

        if (this.waitingForSecondG) {
            this.reset();
            return true;
        }

        this.waitingForSecondG = true;
        this.timer = setTimeout(() => this.reset(), GG_TIMEOUT_MS);
        return false;
    }

    private reset() {
        this.waitingForSecondG = false;
        if (this.timer) clearTimeout(this.timer);
        this.timer = null;
    }
}
