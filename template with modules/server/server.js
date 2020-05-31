const express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const path = require('path');

/**
 * As JavaScript paths work relatively from the executed file, we first to navigate from the
 * current path ('__dirname') one directory back ('..') and from there into the directory client ('client').
 */
const clientPath = path.join(__dirname, '..', 'client');

app.use(express.static(clientPath))

io.on('connection', socket => {
  console.log('A socket connected.');
});

http.listen(3000, () => {
    console.log(`Serving ${clientPath} on *:3000.`)
});