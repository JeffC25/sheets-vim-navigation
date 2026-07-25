import type { Mode, VimState } from './types';

// Upper bound on a count prefix, so a stray "99999j" can't freeze the tab.
const MAX_COUNT = 500;

export class VimStateManager {
    private state: VimState = { mode: 'normal', pendingCount: 0, pendingKeys: [] };
    private listeners: Array<(state: VimState) => void> = [];

    get mode(): Mode {
        return this.state.mode;
    }

    get pendingCount(): number {
        return this.state.pendingCount;
    }

    setMode(mode: Mode) {
        if (this.state.mode === mode) return;
        this.state.mode = mode;
        this.notify();
    }

    hasPendingCount(): boolean {
        return this.state.pendingCount > 0;
    }

    /** Appends a digit to the pending count prefix (e.g. '1' then '2' builds 12). */
    pushCountDigit(digit: string) {
        const next = this.state.pendingCount * 10 + Number(digit);
        this.state.pendingCount = Math.min(next, MAX_COUNT);
        this.notify();
    }

    /** Returns the pending count (at least 1) and resets it. */
    consumeCount(): number {
        const count = this.state.pendingCount || 1;
        this.clearCount();
        return count;
    }

    clearCount() {
        if (this.state.pendingCount === 0) return;
        this.state.pendingCount = 0;
        this.notify();
    }

    onChange(listener: (state: VimState) => void) {
        this.listeners.push(listener);
    }

    private notify() {
        for (const listener of this.listeners) listener(this.state);
    }
}
