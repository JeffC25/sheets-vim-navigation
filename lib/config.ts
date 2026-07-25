import { ActionType } from './types';

export interface Config {
    urlPatterns: string[];
    keymap: Partial<Record<ActionType, string[]>>;
    overlayPosition: 'bottomLeft' | 'bottomRight';
    enabled: boolean;
}

export const DEFAULT_CONFIG: Config = {
    urlPatterns: ['*://docs.google.com/spreadsheets*'],
    keymap: {
        moveUp: ['k'],
        moveDown: ['j'],
        moveLeft: ['h'],
        moveRight: ['l'],
        moveToStart: ['g g'], // space-separated = a two-key sequence
        moveToEnd: ['G'],
        moveToRowStart: ['0'],
        moveToRowEnd: ['$'],
        blockUp: ['{'],
        blockDown: ['}'],
        blockLeft: ['b'],
        blockRight: ['w', 'e'],
        enterInsert: ['i'],
        enterAppend: ['a'],
        enterReplace: ['r'],
        // TODO: add enterVisual once visual mode is implemented
        enterNormal: ['Escape'],
        undo: ['u'],
        redo: ['Ctrl-r'],
    },
    overlayPosition: 'bottomLeft',
    enabled: true,
};
