# Tips and Tricks for efficient programming

## PowerShell

### Scripts

#### Search command history

```ps
Get-Content (Get-PSReadlineOption).HistorySavePath | ? { $_ -like '*my search string*' }
```

## VSCode

### Shortcuts

#### Markdown

| Action | Shortcut |
| --- | --- |
| Open preview | Ctrl + Shift + V |
| Show markdown preview | Ctrl + K V |

## npm

### Run Scripts

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

## ToDos

- [ ] Add SCSS to Vue.js project
- [ ] Add "rename variable/classname/etc. functionality" to VSCode
- [ ] Style activity filter section
- [ ] Switch maps origins
- [ ] Introduce Dependency Injection
- [ ] Color by activity types
