import { CONFIG_ATTR, type MainConfig } from '@/lib/bridge';
import type { Config } from '@/lib/config';
import { urlMatches } from '@/lib/match';
import { loadConfig, onConfigChanged } from '@/lib/storage';

// Isolated world: reads the stored config (which needs extension-API access the MAIN-world handler
// lacks), resolves URL matching + the enable toggle into `active`, and publishes the result onto a
// shared DOM attribute for the handler to consume.
export default defineContentScript({
    matches: ['*://*/*'],
    runAt: 'document_start',
    async main() {
        const publish = (config: Config) => {
            const mainConfig: MainConfig = {
                active: config.enabled && urlMatches(location.href, config.urlPatterns),
                keymap: config.keymap,
                overlayPosition: config.overlayPosition,
            };
            document.documentElement.setAttribute(CONFIG_ATTR, JSON.stringify(mainConfig));
        };

        publish(await loadConfig());
        onConfigChanged(publish);
    },
});
