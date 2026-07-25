import { isMac, jumpToCell, readActiveCell, simulateKey } from './navigation';
import type { VimStateManager } from './state';
import type { ActionType } from './types';

// The modifier Sheets uses for jump-to-edge navigation (Cmd on macOS, Ctrl elsewhere).
const jumpModifier = isMac ? { metaKey: true } : { ctrlKey: true };

function repeat(count: number, fn: () => void) {
    for (let i = 0; i < count; i++) fn();
}

// `count` is the vim-style repeat prefix (e.g. 5j). It applies to the relative motions below;
// absolute jumps (gg/G/0/$) and mode changes ignore it.
export function executeAction(actionType: ActionType, state: VimStateManager, count = 1) {
    switch (actionType) {
        case 'moveUp':
            repeat(count, () => simulateKey('ArrowUp'));
            break;
        case 'moveDown':
            repeat(count, () => simulateKey('ArrowDown'));
            break;
        case 'moveLeft':
            repeat(count, () => simulateKey('ArrowLeft'));
            break;
        case 'moveRight':
            repeat(count, () => simulateKey('ArrowRight'));
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
            repeat(count, () => simulateKey('ArrowUp', jumpModifier));
            break;
        case 'blockDown':
            // Ctrl/Cmd+Down jumps to the next data-block edge, staying in the same column.
            repeat(count, () => simulateKey('ArrowDown', jumpModifier));
            break;
        case 'blockLeft':
            // Ctrl/Cmd+Left jumps to the previous data-block edge, staying in the same row.
            repeat(count, () => simulateKey('ArrowLeft', jumpModifier));
            break;
        case 'blockRight':
            // Ctrl/Cmd+Right jumps to the next data-block edge, staying in the same row.
            repeat(count, () => simulateKey('ArrowRight', jumpModifier));
            break;
        case 'moveToRowStart':
            // Unmodified Home moves to the first column of the current row.
            simulateKey('Home');
            break;
        case 'moveToRowEnd': {
            // $: jump to the last used column of the current row. Probe the used range's last
            // column with Ctrl/Cmd+End, then jump back to the original row via the Name Box.
            const start = readActiveCell();
            if (!start) {
                simulateKey('ArrowRight', jumpModifier); // fallback
                break;
            }
            simulateKey('End', jumpModifier);
            requestAnimationFrame(() => {
                const end = readActiveCell();
                jumpToCell(`${end?.col ?? start.col}${start.row}`);
            });
            break;
        }
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
        case 'undo':
            // Sheets undo: Cmd+Z on macOS, Ctrl+Z elsewhere.
            repeat(count, () => simulateKey('z', jumpModifier));
            break;
        case 'redo':
            // Sheets redo: Cmd+Shift+Z on macOS, Ctrl+Y elsewhere.
            repeat(count, () =>
                isMac
                    ? simulateKey('z', { metaKey: true, shiftKey: true })
                    : simulateKey('y', { ctrlKey: true }),
            );
            break;
    }
}
