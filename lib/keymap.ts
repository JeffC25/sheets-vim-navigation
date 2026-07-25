import type { Config } from './config';
import type { ActionType } from './types';

/**
 * Canonical string for a keypress, including a modifier prefix so bindings can distinguish e.g.
 * `r` from `Ctrl-r`. Bare keys only match when no Ctrl/Meta is held, so Sheets/browser shortcuts
 * (Cmd+A, Cmd+C, …) fall through instead of colliding with single-letter motions.
 */
export function eventToken(event: KeyboardEvent): string {
    if (event.ctrlKey) return `Ctrl-${event.key}`;
    if (event.metaKey) return `Meta-${event.key}`;
    return event.key;
}

export function resolveActionType(event: KeyboardEvent, config: Config): ActionType | null {
    const token = eventToken(event);
    for (const [actionType, keys] of Object.entries(config.keymap)) {
        if (keys.includes(token)) return actionType as ActionType;
    }
    return null;
}
