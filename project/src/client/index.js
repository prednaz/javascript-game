// @flow

const socket = require("socket.io-client")();

socket.emit("message", "hi");

console.log("hi");
