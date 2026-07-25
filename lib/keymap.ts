import type { Config } from './config';
import type { ActionType } from './types';

export function resolveActionType(key: string, config: Config): ActionType | null {
    for (const [actionType, keys] of Object.entries(config.keymap)) {
        if (keys.includes(key)) return actionType as ActionType;
    }
    return null;
}
