import type { Config } from './config';
import type { ActionType } from './types';

/** One parsed binding: a sequence of key tokens that triggers an action (e.g. ['g', 'g']). */
export interface Binding {
    action: ActionType;
    tokens: string[];
}

/**
 * Canonical string for a single keypress, including a modifier prefix so bindings can distinguish
 * e.g. `r` from `Ctrl-r`. Bare keys only get a prefix-free token when no Ctrl/Meta is held, so
 * Sheets/browser shortcuts (Cmd+A, Cmd+C, …) don't collide with single-letter motions.
 */
export function eventToken(event: KeyboardEvent): string {
    if (event.ctrlKey) return `Ctrl-${event.key}`;
    if (event.metaKey) return `Meta-${event.key}`;
    return event.key;
}

/** A binding string is a whitespace-separated sequence of tokens: `g g`, `Escape`, `Ctrl-r`. */
export function parseBinding(binding: string): string[] {
    return binding.trim().split(/\s+/).filter(Boolean);
}

/** Flattens the keymap into a list of bindings (one per alternative key sequence). */
export function buildBindings(keymap: Config['keymap']): Binding[] {
    const bindings: Binding[] = [];
    for (const [action, alternatives] of Object.entries(keymap)) {
        for (const alt of alternatives ?? []) {
            const tokens = parseBinding(alt);
            if (tokens.length) bindings.push({ action: action as ActionType, tokens });
        }
    }
    return bindings;
}
