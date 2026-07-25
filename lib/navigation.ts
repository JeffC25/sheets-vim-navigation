interface SimulatedKeyOptions {
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
}

// On macOS, Sheets binds jump-to-edge shortcuts to Cmd (meta); elsewhere they use Ctrl.
export const isMac = navigator.platform.includes('Mac');

// Sheets' grid handler reads the legacy keyCode/which properties, which the KeyboardEvent
// constructor always leaves at 0. We override them below via Object.defineProperty, which only
// works because this content script runs in the page's MAIN world — overridden properties are
// stripped when an event crosses from an isolated-world content script into the page.
const KEY_CODES: Record<string, number> = {
    ArrowUp: 38,
    ArrowDown: 40,
    ArrowLeft: 37,
    ArrowRight: 39,
    Home: 36,
    End: 35,
    F2: 113,
    Escape: 27,
    Enter: 13,
    Tab: 9,
};

// The hidden element Sheets attaches its grid keyboard handlers to. Keys dispatched elsewhere
// (e.g. document.activeElement) are ignored by the grid.
const RICH_TEXT_EDITOR_ID = 'waffle-rich-text-editor';

/**
 * Dispatches a synthetic native keydown/keyup pair at Sheets' grid editor element, so that
 * Google Sheets' own keyboard-driven grid navigation runs exactly as if a real key were pressed.
 */
export function simulateKey(key: string, options: SimulatedKeyOptions = {}) {
    const target =
        document.getElementById(RICH_TEXT_EDITOR_ID) ?? document.activeElement ?? document.body;
    if (!target) return;

    const keyCode = KEY_CODES[key];
    const eventInit: KeyboardEventInit = {
        key,
        code: key,
        bubbles: true,
        cancelable: true,
        ctrlKey: options.ctrlKey ?? false,
        metaKey: options.metaKey ?? false,
        shiftKey: options.shiftKey ?? false,
    };

    // Sheets needs all three events for some keys to register (notably Enter), so we send the full
    // keydown/keypress/keyup sequence. The simulated keys are all non-printable (arrows, Home, End,
    // F2, Enter), so the extra keypress can't double-insert characters into a cell.
    for (const type of ['keydown', 'keypress', 'keyup'] as const) {
        const event = new KeyboardEvent(type, eventInit);
        if (keyCode !== undefined) {
            Object.defineProperty(event, 'keyCode', { get: () => keyCode });
            Object.defineProperty(event, 'which', { get: () => keyCode });
        }
        target.dispatchEvent(event);
    }
}
