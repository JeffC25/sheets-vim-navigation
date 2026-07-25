import type { Binding } from './keymap';
import type { ActionType } from './types';

// How long to wait for the next key of a partial sequence (e.g. the second `g` of `gg`) before
// giving up and clearing the buffer.
const SEQUENCE_TIMEOUT_MS = 500;

export type MatchResult =
    | { status: 'fired'; action: ActionType }
    | { status: 'pending' } // buffer is a prefix of a longer binding; wait for more keys
    | { status: 'none' }; // buffer matches nothing

/**
 * Matches a stream of key tokens against binding sequences. Generalizes the old `gg`-only tracker:
 * any binding can be multiple keys, and which keys they are lives entirely in the keymap.
 *
 * Note: if one binding is a strict prefix of another (e.g. both `g` and `g g` are bound), only the
 * longer one can fire — the shorter is treated as an incomplete prefix.
 */
export class SequenceMatcher {
    private buffer: string[] = [];
    private timer: ReturnType<typeof setTimeout> | null = null;

    reset() {
        this.buffer = [];
        if (this.timer) clearTimeout(this.timer);
        this.timer = null;
    }

    push(token: string, bindings: Binding[]): MatchResult {
        this.buffer.push(token);
        let result = this.classify(bindings);
        // If the accumulated buffer leads nowhere, restart the sequence from just this key so a
        // fresh binding (or prefix) still has a chance to match.
        if (result.status === 'none' && this.buffer.length > 1) {
            this.buffer = [token];
            result = this.classify(bindings);
        }
        // Keep the buffer only while waiting for more keys of a sequence.
        if (result.status !== 'pending') this.reset();
        return result;
    }

    private classify(bindings: Binding[]): MatchResult {
        const buffer = this.buffer;
        const hasLonger = bindings.some(
            (b) => b.tokens.length > buffer.length && startsWith(b.tokens, buffer),
        );
        if (hasLonger) {
            this.startTimer();
            return { status: 'pending' };
        }

        const exact = bindings.find((b) => sequenceEquals(b.tokens, buffer));
        return exact ? { status: 'fired', action: exact.action } : { status: 'none' };
    }

    private startTimer() {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.reset(), SEQUENCE_TIMEOUT_MS);
    }
}

function sequenceEquals(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((token, i) => token === b[i]);
}

function startsWith(sequence: string[], prefix: string[]): boolean {
    return prefix.every((token, i) => sequence[i] === token);
}
