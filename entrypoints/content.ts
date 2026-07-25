import { executeAction } from '@/lib/actions';
import { DEFAULT_CONFIG } from '@/lib/config';
import { resolveActionType } from '@/lib/keymap';
import { simulateKey } from '@/lib/navigation';
import { createOverlay } from '@/lib/overlay';
import { PrefixTracker } from '@/lib/prefix';
import { VimStateManager } from '@/lib/state';

export default defineContentScript({
    matches: DEFAULT_CONFIG.urlPatterns,
    // Run in the page's MAIN world so synthesized key events keep their overridden keyCode/which
    // properties, which Sheets' grid handler requires (see lib/navigation.ts).
    world: 'MAIN',
    main() {
        if (!DEFAULT_CONFIG.enabled) return;

        const state = new VimStateManager();
        const overlay = createOverlay(DEFAULT_CONFIG.overlayPosition);
        const prefixTracker = new PrefixTracker();

        overlay.mount();
        overlay.update(state.mode);
        state.onChange((s) => overlay.update(s.mode));

        document.addEventListener(
            'keydown',
            (event) => {
                if (state.mode === 'insert') {
                    if (event.key === 'Escape') {
                        // Sheets' native Escape cancels the edit, discarding changes. Instead,
                        // commit like vim: Enter commits (and moves down), then Up returns to the
                        // original cell.
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        simulateKey('Enter');
                        simulateKey('ArrowUp');
                        state.setMode('normal');
                        return;
                    }
                    // Enter/Tab commit natively and move the cursor; just sync our mode. All other
                    // keys pass through untouched to Sheets' cell editor.
                    if (event.key === 'Enter' || event.key === 'Tab') {
                        state.setMode('normal');
                    }
                    return;
                }

                const actionType = resolveActionType(event.key, DEFAULT_CONFIG);
                if (!actionType) {
                    // In normal mode, swallow bare printable keys so they don't start editing the
                    // cell. Let modifier combos through so Sheets/browser shortcuts still work.
                    const isTypingKey =
                        event.key.length === 1 &&
                        !event.ctrlKey &&
                        !event.metaKey &&
                        !event.altKey;
                    if (isTypingKey) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                    }
                    return;
                }

                if (actionType === 'moveToStart') {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    if (prefixTracker.consume(event.key)) {
                        executeAction('moveToStart', state);
                    }
                    return;
                }

                event.preventDefault();
                event.stopImmediatePropagation();
                executeAction(actionType, state);
            },
            true,
        );
    },
});
