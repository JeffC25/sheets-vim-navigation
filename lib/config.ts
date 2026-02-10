import { ActionType } from './types';

export interface Config {
    urlPatterns: string[];
    keymap: Partial<Record<ActionType, string>>;
    overlayPosition: 'bottomLeft' | 'bottonRight';
    enabled: boolean;
}

export const DEFAULT_CONFIG: Config = {
    urlPatterns: ['*://*.docs.google.com/spreadsheets*'],
    keymap: {
        moveUp: 'k',
        moveDown: 'j',
        moveLeft: 'h',
        moveRight: 'l',
        moveToStart: 'g', // TODO: operator-pending state to support `gg` sequence
        moveToEnd: 'G',
        enterInsert: 'i',
        enterAppend: 'a',
        enterVisual: 'v',
        enterNormal: 'Escape',
    },
    overlayPosition: 'bottomLeft',
    enabled: false,
};
