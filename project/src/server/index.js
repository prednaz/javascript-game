// @flow

const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {serveClient: false});
app.use(express.static("dist"));

io.on("connection", socket => {
    console.log("a user connected");
    socket.on("message", content => {
        console.log(content);
    });
});

http.listen(1234, () => {
    console.log("listening on *:1234");
});
