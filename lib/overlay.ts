import type { Config } from './config';
import type { Mode } from './types';

const OVERLAY_ID = 'vim-sheets-mode-overlay';

const MODE_COLORS: Record<Mode, string> = {
    normal: '#1a1a1a',
    insert: '#2e7d32',
    visual: '#6a1b9a',
};

export function createOverlay(position: Config['overlayPosition']) {
    const el = document.createElement('div');
    el.id = OVERLAY_ID;
    Object.assign(el.style, {
        position: 'fixed',
        bottom: '12px',
        [position === 'bottomLeft' ? 'left' : 'right']: '12px',
        zIndex: '2147483647',
        padding: '4px 10px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#fff',
        pointerEvents: 'none',
    } satisfies Partial<CSSStyleDeclaration>);

    return {
        mount() {
            document.body.appendChild(el);
        },
        update(mode: Mode, pendingCount = 0) {
            const count = pendingCount > 0 ? ` ${pendingCount}` : '';
            el.textContent = mode.toUpperCase() + count;
            el.style.backgroundColor = MODE_COLORS[mode];
        },
    };
}
