// @flow

const socket = io();

socket.emit("message", "hi");

console.log("hi");
