import { isMac, simulateKey } from './navigation';
import type { VimStateManager } from './state';
import type { ActionType } from './types';

// The modifier Sheets uses for jump-to-edge (Ctrl+Home / Cmd+Home etc.).
const jumpModifier = isMac ? { metaKey: true } : { ctrlKey: true };

export function executeAction(actionType: ActionType, state: VimStateManager) {
    switch (actionType) {
        case 'moveUp':
            simulateKey('ArrowUp');
            break;
        case 'moveDown':
            simulateKey('ArrowDown');
            break;
        case 'moveLeft':
            simulateKey('ArrowLeft');
            break;
        case 'moveRight':
            simulateKey('ArrowRight');
            break;
        case 'moveToStart':
            simulateKey('Home', jumpModifier);
            break;
        case 'moveToEnd':
            simulateKey('End', jumpModifier);
            break;
        case 'enterInsert':
        case 'enterAppend':
            simulateKey('F2');
            state.setMode('insert');
            break;
        case 'enterNormal':
            state.setMode('normal');
            break;
    }
}
