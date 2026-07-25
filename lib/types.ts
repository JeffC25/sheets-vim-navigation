export type Mode = 'normal' | 'insert' | 'visual';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type ActionType =
    | 'moveUp'
    | 'moveDown'
    | 'moveLeft'
    | 'moveRight'
    | 'moveToStart'
    | 'moveToEnd'
    | 'moveToRowStart'
    | 'blockUp'
    | 'blockDown'
    | 'enterInsert'
    | 'enterAppend'
    | 'enterReplace'
    | 'enterVisual'
    | 'enterNormal';

export type Action =
    | { type: 'move'; direction: Direction; count: number }
    | { type: 'moveToStart' }
    | { type: 'moveToEnd' }
    | { type: 'enterInsert' }
    | { type: 'enterInsertAppend' }
    | { type: 'enterVisual' }
    | { type: 'enterNormal' }
    | { type: 'none' };

export interface VimState {
    mode: Mode;
    pendingCount: number;
    pendingKeys: string[];
}

