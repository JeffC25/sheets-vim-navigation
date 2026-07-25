import type { Config } from './config';
import type { Mode } from './types';

const OVERLAY_ID = 'vim-sheets-mode-overlay';

const MODE_COLORS: Record<Mode, string> = {
    normal: '#1a1a1a',
    insert: '#2e7d32',
    visual: '#6a1b9a',
};

export function createOverlay() {
    const el = document.createElement('div');
    el.id = OVERLAY_ID;
    Object.assign(el.style, {
        position: 'fixed',
        bottom: '12px',
        zIndex: '2147483647',
        padding: '4px 10px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#fff',
        pointerEvents: 'none',
        display: 'none',
    } satisfies Partial<CSSStyleDeclaration>);

    let mounted = false;

    return {
        setPosition(position: Config['overlayPosition']) {
            if (position === 'bottomLeft') {
                el.style.left = '12px';
                el.style.right = 'auto';
            } else {
                el.style.right = '12px';
                el.style.left = 'auto';
            }
        },
        setVisible(visible: boolean) {
            if (visible && !mounted && document.body) {
                document.body.appendChild(el);
                mounted = true;
            }
            el.style.display = visible ? 'block' : 'none';
        },
        update(mode: Mode, pendingCount = 0) {
            const count = pendingCount > 0 ? ` ${pendingCount}` : '';
            el.textContent = mode.toUpperCase() + count;
            el.style.backgroundColor = MODE_COLORS[mode];
        },
    };
}
