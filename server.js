var express = require('express'), app = express(), 
  server = require('http').createServer(app).listen(80),
  io = require('socket.io').listen(server, {
  	'log level': 2
  });

app.use( express.static(__dirname + '/www') );

io.sockets.on('connection', function (socket) {
  socket.on('message', function (data) {
  	socket.broadcast.emit('message', data);
  });
  socket.broadcast.emit('message', 'user connected');
});