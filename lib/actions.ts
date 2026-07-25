import { isMac, jumpToCell, readActiveCell, simulateKey } from './navigation';
import type { VimStateManager } from './state';
import type { ActionType } from './types';

// The modifier Sheets uses for jump-to-edge navigation (Cmd on macOS, Ctrl elsewhere).
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
        case 'moveToStart': {
            // gg: jump to the absolute first row of the current column.
            const cell = readActiveCell();
            if (cell && jumpToCell(`${cell.col}1`)) break;
            simulateKey('ArrowUp', jumpModifier); // fallback if the Name Box isn't available
            break;
        }
        case 'moveToEnd': {
            // G: jump to the absolute last (used) row of the current column. Probe the last data
            // row with Ctrl/Cmd+End, then jump back to the original column via the Name Box.
            const start = readActiveCell();
            if (!start) {
                simulateKey('ArrowDown', jumpModifier); // fallback
                break;
            }
            simulateKey('End', jumpModifier);
            requestAnimationFrame(() => {
                const end = readActiveCell();
                jumpToCell(`${start.col}${end?.row ?? start.row}`);
            });
            break;
        }
        case 'blockUp':
            // Ctrl/Cmd+Up jumps to the previous data-block edge, staying in the same column.
            simulateKey('ArrowUp', jumpModifier);
            break;
        case 'blockDown':
            // Ctrl/Cmd+Down jumps to the next data-block edge, staying in the same column.
            simulateKey('ArrowDown', jumpModifier);
            break;
        case 'moveToRowStart':
            // Unmodified Home moves to the first column of the current row.
            simulateKey('Home');
            break;
        case 'enterInsert':
        case 'enterAppend':
            // F2 opens the cell editor with its existing content, so typing appends.
            simulateKey('F2');
            state.setMode('insert');
            break;
        case 'enterReplace':
            // No F2: with the cell merely selected, the next typed character overwrites its
            // contents (native Sheets behavior), giving vim-style replace.
            state.setMode('insert');
            break;
        case 'enterNormal':
            state.setMode('normal');
            break;
    }
}
