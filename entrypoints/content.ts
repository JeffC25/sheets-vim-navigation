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
        overlay.update(state.mode, state.pendingCount);
        state.onChange((s) => overlay.update(s.mode, s.pendingCount));

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

                // Numeric count prefix (e.g. 5j). '0' is only a count digit while a count is
                // already building; otherwise it's the moveToRowStart motion.
                const isDigit =
                    event.key.length === 1 &&
                    event.key >= '0' &&
                    event.key <= '9' &&
                    !event.ctrlKey &&
                    !event.metaKey &&
                    !event.altKey;
                if (isDigit && (event.key !== '0' || state.hasPendingCount())) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    state.pushCountDigit(event.key);
                    return;
                }

                const actionType = resolveActionType(event, DEFAULT_CONFIG);
                if (!actionType) {
                    // Any non-motion key cancels a pending count.
                    state.clearCount();
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
                    state.clearCount(); // gg ignores counts
                    if (prefixTracker.consume(event.key)) {
                        executeAction('moveToStart', state);
                    }
                    return;
                }

                event.preventDefault();
                event.stopImmediatePropagation();
                executeAction(actionType, state, state.consumeCount());
            },
            true,
        );
    },
});
