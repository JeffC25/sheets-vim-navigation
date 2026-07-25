import { browser } from 'wxt/browser';
import { loadConfig, saveConfig } from '@/lib/storage';

const enabledEl = document.getElementById('enabled') as HTMLInputElement;
const optionsEl = document.getElementById('options') as HTMLButtonElement;

loadConfig().then((config) => {
    enabledEl.checked = config.enabled;
});

enabledEl.addEventListener('change', async () => {
    const config = await loadConfig();
    await saveConfig({ ...config, enabled: enabledEl.checked });
});

optionsEl.addEventListener('click', () => {
    browser.runtime.openOptionsPage();
});
