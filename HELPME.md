# Tips and Tricks for efficient programming

This document is a living collection of helpful information about things like [settings](#settings), [extensions](#extensions) and [shortcuts](#shortcuts) for working more efficient on a variety of projects in **VSCode**.

## VSCode

### Extensions

- Code Spell Checker
- Debugger for Firefox
- ESLint
- Git History
- HTML CSS Support
- Markdown Checkboxes
- markdownlint
- npm Intellisense
- PowerShell

### Settings

```json
"editor.linkedEditing": true
```

### Shortcuts

#### General

| Action | Shortcut |
| --- | --- |
| Rename all instances | F2 |
| Open 'Run Command' | Ctrl + Shift + P |

#### Markdown

| Action | Shortcut |
| --- | --- |
| Open preview | Ctrl + Shift + V |
| Show markdown preview | Ctrl + K V |

### Issues

- **Modules cannot be found (anymore)** \
*Solution:* Run VSCode Command "Developer: Reload Window"

## PowerShell

### PS Scripts

#### Search command history

```ps
Get-Content (Get-PSReadlineOption).HistorySavePath | ? { $_ -like '*my search string*' }
```

## npm

### CLI Commands

#### TailwindCSS

- initialize and watch:

```powershell
npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css --watch
```

#### Concurrently

- ```npm install --save-dev concurrently```
- available color options [**-c**]: black, red, green, yellow, blue, magenta, cyan, white, gray
- Example use:

``` json
"scripts": {
  "start": "concurrently -n TAILWIND,VITE -c yellow,cyan \"npm:watch\" \"npm:dev\"",
  "dev": "vite",
  "build": "vue-tsc -b && vite build",
  "preview": "vite preview",
  "watch": "npx @tailwindcss/cli -i ./src/style.css -o ./src/output.css --watch"
}
```
