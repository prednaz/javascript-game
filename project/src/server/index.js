// @flow

// https://github.com/parcel-bundler/parcel/issues/2398
const fs = require("fs");
const index = require("path").join("dist", "index.html");
fs.writeFileSync(
    index,
    fs.readFileSync(index, "utf8").replace("//parcel_ignore:", ""),
    "utf8"
);

const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
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
