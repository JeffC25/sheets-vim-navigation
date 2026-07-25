import type { Mode, VimState } from './types';

export class VimStateManager {
    private state: VimState = { mode: 'normal', pendingCount: 0, pendingKeys: [] };
    private listeners: Array<(state: VimState) => void> = [];

    get mode(): Mode {
        return this.state.mode;
    }

    setMode(mode: Mode) {
        if (this.state.mode === mode) return;
        this.state.mode = mode;
        this.notify();
    }

    onChange(listener: (state: VimState) => void) {
        this.listeners.push(listener);
    }

    private notify() {
        for (const listener of this.listeners) listener(this.state);
    }
}
