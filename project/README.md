# Playing With Fire

## Build

Run
```shell
npm install
npm run build
node js/server/index.js
```
.

## Develop

In Visual Studio Code, search for the extension matching `@builtin typescript-language-features` and disable it. Then install the extension [Flow Language Support](https://marketplace.visualstudio.com/items?itemName=flowtype.flow-for-vscode). Run
```shell
npm run babel
npm run parcel
```
. Stop a running server and restart it running `node js/server/index.js` on every change to the server.
