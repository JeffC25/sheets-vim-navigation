import { browser } from 'wxt/browser';
import { DEFAULT_CONFIG, type Config } from './config';

const STORAGE_KEY = 'config';

/** Fills in any missing fields (including keymap actions) from the defaults. */
export function mergeConfig(partial?: Partial<Config>): Config {
    return {
        ...DEFAULT_CONFIG,
        ...partial,
        keymap: { ...DEFAULT_CONFIG.keymap, ...(partial?.keymap ?? {}) },
    };
}

export async function loadConfig(): Promise<Config> {
    const stored = await browser.storage.local.get(STORAGE_KEY);
    return mergeConfig(stored[STORAGE_KEY] as Partial<Config> | undefined);
}

export async function saveConfig(config: Config): Promise<void> {
    await browser.storage.local.set({ [STORAGE_KEY]: config });
}

export function onConfigChanged(callback: (config: Config) => void): void {
    browser.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes[STORAGE_KEY]) {
            callback(mergeConfig(changes[STORAGE_KEY].newValue as Partial<Config> | undefined));
        }
    });
}
