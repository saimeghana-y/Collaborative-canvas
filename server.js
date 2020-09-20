var express = require('express'),
  app = express(),
  http = require('http'),
  socket = require('socket.io');

var server = http.createServer(app);
var io = socket.listen(server);
server.listen(process.env.PORT || 8080);

app.use(express.static(__dirname + '/public'));
console.log('Server running on 127.0.0.1:8080');

var line_history = [];
var lineEmit = 'canvas line';

io.on('connection', function (socket) {
  // first send the history to the new client
  for (var i in line_history) {
    socket.emit(lineEmit, line_history[i]);
  }

  // add handler for message type "draw_line".
  socket.on(lineEmit, function (data) {
    //add received line to history
    line_history.push(data);
    // send line to all clients
    socket.broadcast.emit(lineEmit, data);
    //console.log(data);
  });

  socket.on('clearit', function () {
    line_history = [];
    io.emit('clearit', true);
  });
});
