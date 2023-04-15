# vue-starter

## Description


## Plugins from Visual Studio Code

For automatic formatting and code / error highlighting to work, you need to install such plugins:

- `dbaeumer.vscode-eslint`
- `esbenp.prettier-vscode`

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn dev
```

### Compiles and minifies for production
```
yarn build
```

### Run your unit tests
```
yarn test:unit
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


let { rss, heapTotal, heapUsed, external, arrayBuffers } = process.memoryUsage();
console.log({
  rss: rss / 1000,
  heapTotal: heapTotal / 1000,
  heapUsed: heapUsed / 1000,
  external: external / 1000,
  arrayBuffers: arrayBuffers / 1000,
});