# sheets-vim-navigation

Lightweight Vim-style keyboard navigation for Google Sheets, as a browser extension (built with [WXT](https://wxt.dev)).

## Keys

Normal mode (default):

| Key       | Action                                        |
| --------- | --------------------------------------------- |
| `h j k l` | move left / down / up / right                 |
| `w` / `e` | jump to next data-block edge (right)          |
| `b`       | jump to previous data-block edge (left)       |
| `}` / `{` | jump to next / previous data-block edge (down / up) |
| `0`       | first column of the row                       |
| `$`       | last used column of the row                   |
| `gg`      | first row of the column                       |
| `G`       | last used row of the column                   |
| `i` / `a` | edit cell (append)                            |
| `r`       | replace cell contents                         |
| `Esc`     | commit edit and return to normal mode         |

## Develop

```sh
npm install
npm run dev      # launches Chrome with the extension loaded
npm run build    # outputs to .output/chrome-mv3/
```

To load a build manually: `chrome://extensions` → enable Developer Mode → **Load unpacked** → select `.output/chrome-mv3/`.
