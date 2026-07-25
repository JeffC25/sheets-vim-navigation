import type { Config } from './config';

// The isolated bridge publishes config to the MAIN-world handler by writing JSON to this attribute
// on <html> (the DOM is shared across worlds; extension-API access and overridden event properties
// are not). The handler reads it and watches it via MutationObserver.
export const CONFIG_ATTR = 'data-svn-config';

// The slice of config the MAIN-world key handler needs. `enabled` and `urlPatterns` are resolved by
// the bridge into a single `active` flag, so the handler never has to know about URL matching.
export interface MainConfig {
    active: boolean;
    keymap: Config['keymap'];
    overlayPosition: Config['overlayPosition'];
}
