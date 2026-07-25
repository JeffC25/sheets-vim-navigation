import { executeAction } from '@/lib/actions';
import { CONFIG_ATTR, type MainConfig } from '@/lib/bridge';
import { buildBindings, eventToken, type Binding } from '@/lib/keymap';
import { simulateKey } from '@/lib/navigation';
import { createOverlay } from '@/lib/overlay';
import { SequenceMatcher } from '@/lib/sequence';
import { VimStateManager } from '@/lib/state';

export default defineContentScript({
    // Broad match; the isolated bridge decides whether we're actually active on this URL.
    matches: ['*://*/*'],
    // Run in the page's MAIN world so synthesized key events keep their overridden keyCode/which
    // properties, which Sheets' grid handler requires (see lib/navigation.ts).
    world: 'MAIN',
    main() {
        const state = new VimStateManager();
        const overlay = createOverlay();
        const matcher = new SequenceMatcher();

        state.onChange((s) => overlay.update(s.mode, s.pendingCount));

        // Config is published by the isolated bridge onto a shared <html> attribute.
        let active = false;
        let bindings: Binding[] = [];

        const readConfig = (): MainConfig | null => {
            const raw = document.documentElement.getAttribute(CONFIG_ATTR);
            if (!raw) return null;
            try {
                return JSON.parse(raw) as MainConfig;
            } catch {
                return null;
            }
        };

        const applyConfig = (config: MainConfig | null) => {
            active = config?.active ?? false;
            bindings = buildBindings(config?.keymap ?? {});
            matcher.reset();
            overlay.setPosition(config?.overlayPosition ?? 'bottomLeft');
            overlay.setVisible(active);
            if (active) {
                overlay.update(state.mode, state.pendingCount);
            } else {
                state.setMode('normal');
                state.clearCount();
            }
        };

        applyConfig(readConfig());
        // React to live config changes (bridge rewrites the attribute on storage updates).
        new MutationObserver(() => applyConfig(readConfig())).observe(document.documentElement, {
            attributes: true,
            attributeFilter: [CONFIG_ATTR],
        });

        document.addEventListener(
            'keydown',
            (event) => {
                if (!active) return;

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
                    matcher.reset(); // a count digit abandons any half-typed sequence
                    state.pushCountDigit(event.key);
                    return;
                }

                const match = matcher.push(eventToken(event), bindings);

                if (match.status === 'pending') {
                    // Mid-sequence (e.g. first `g` of `gg`): swallow so it doesn't reach the cell.
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    return;
                }

                if (match.status === 'fired') {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    executeAction(match.action, state, state.consumeCount());
                    return;
                }

                // No binding matched. Cancel any pending count, and swallow bare printable keys so
                // they don't start editing the cell. Modifier combos pass through to Sheets/browser.
                state.clearCount();
                const isTypingKey =
                    event.key.length === 1 &&
                    !event.ctrlKey &&
                    !event.metaKey &&
                    !event.altKey;
                if (isTypingKey) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            },
            true,
        );
    },
});
