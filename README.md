# sheets-vim-navigation

Lightweight Vim-style keyboard navigation for Google Sheets, as a browser extension (built with [WXT](https://wxt.dev)).

## Keys

Normal mode (default):

| Key   | Action                          |
| ----- | ------------------------------- |
| `hjkl` | move left / down / up / right  |
| `gg`  | jump to first cell (A1)         |
| `G`   | jump to last cell of used range |
| `i` / `a` | edit cell (append)          |
| `r`   | replace cell contents           |
| `Esc` | return to normal mode           |

## Develop

```sh
npm install
npm run dev      # launches Chrome with the extension loaded
npm run build    # outputs to .output/chrome-mv3/
```

To load a build manually: `chrome://extensions` → enable Developer Mode → **Load unpacked** → select `.output/chrome-mv3/`.
