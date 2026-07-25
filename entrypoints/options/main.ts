import { DEFAULT_CONFIG, type Config } from '@/lib/config';
import { loadConfig, saveConfig } from '@/lib/storage';
import type { ActionType } from '@/lib/types';

// Human-readable labels, in display order. Also defines which actions appear in the editor.
const ACTION_LABELS: [ActionType, string][] = [
    ['moveUp', 'Move up'],
    ['moveDown', 'Move down'],
    ['moveLeft', 'Move left'],
    ['moveRight', 'Move right'],
    ['moveToRowStart', 'Row start'],
    ['moveToRowEnd', 'Row end'],
    ['moveToStart', 'Column top (gg)'],
    ['moveToEnd', 'Column bottom (G)'],
    ['blockUp', 'Block up'],
    ['blockDown', 'Block down'],
    ['blockLeft', 'Block left'],
    ['blockRight', 'Block right'],
    ['enterInsert', 'Insert'],
    ['enterAppend', 'Append'],
    ['enterReplace', 'Replace'],
    ['enterNormal', 'Normal / commit'],
    ['undo', 'Undo'],
    ['redo', 'Redo'],
];

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const keymapEl = $<HTMLDivElement>('keymap');
const urlPatternsEl = $<HTMLTextAreaElement>('urlPatterns');
const overlayPositionEl = $<HTMLSelectElement>('overlayPosition');
const enabledEl = $<HTMLInputElement>('enabled');
const statusEl = $<HTMLSpanElement>('status');

// Build one labelled text input per action.
for (const [action, label] of ACTION_LABELS) {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<label for="key-${action}">${label}</label>`;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'mono';
    input.id = `key-${action}`;
    row.appendChild(input);
    keymapEl.appendChild(row);
}

function render(config: Config) {
    for (const [action] of ACTION_LABELS) {
        $<HTMLInputElement>(`key-${action}`).value = (config.keymap[action] ?? []).join(', ');
    }
    urlPatternsEl.value = config.urlPatterns.join('\n');
    overlayPositionEl.value = config.overlayPosition;
    enabledEl.checked = config.enabled;
}

function collect(): Config {
    const keymap: Config['keymap'] = {};
    for (const [action] of ACTION_LABELS) {
        keymap[action] = $<HTMLInputElement>(`key-${action}`).value
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean);
    }
    return {
        keymap,
        urlPatterns: urlPatternsEl.value
            .split('\n')
            .map((p) => p.trim())
            .filter(Boolean),
        overlayPosition: overlayPositionEl.value as Config['overlayPosition'],
        enabled: enabledEl.checked,
    };
}

function flashSaved() {
    statusEl.classList.add('show');
    setTimeout(() => statusEl.classList.remove('show'), 1500);
}

$<HTMLFormElement>('form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveConfig(collect());
    flashSaved();
});

$<HTMLButtonElement>('reset').addEventListener('click', async () => {
    render(DEFAULT_CONFIG);
    await saveConfig(DEFAULT_CONFIG);
    flashSaved();
});

loadConfig().then(render);
