var express = require('express');
var mongoose = require('mongoose');
var __ = require('lodash');

// model definitions
require('require-dir')('./models');
var Game = mongoose.model('Game');

// route definitions
var home = require('./routes/home');

var app = express();
var RedisStore = require('connect-redis')(express);
mongoose.connect('mongodb://localhost/holidayko');

// configure express
require('./config').initialize(app, RedisStore);

// routes
app.get('/', home.index);

// start server & socket.io
var common = require('./sockets/common');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, {log: true, 'log level': 2});
server.listen(app.get('port'));
io.of('/app').on('connection', common.connection);

var sockets = io.namespaces['/app'].sockets;

setInterval(function(){
  var length = __.sample(__.range(1,11));
  Game.find().populate('players').exec(function(err,games){
    var easterEggs = [];
    for(var i = 0; i < length; i++){
      var egg = {};
      egg.x = __.sample(__.range(10));
      egg.y = __.sample(__.range(10));
      egg.type = __.sample(['attack', 'potion', 'quicksand']);

      if (egg.type === 'potion') {
        egg.healthBoost = __.sample(__.range(1,101));
      };

      if (egg.type === 'attack') {
        egg.attackBoost = 5;
      };

      if (egg.type === 'quicksand') {
        egg.quicksand = true;
      };

      easterEggs.push(egg);
    }
    for(var x = 0; x < games.length; x++){
      games[x].easterEggs = easterEggs;
      games[x].markModified('easterEggs');
      games[x].save(function(err,game){
      });
    }

    for(var j = 0; j < games.length; j++){
      for(var i = 0; i < games[j].players.length; i++){
        if(sockets[games[j].players[i].socketId]){
          sockets[games[j].players[i].socketId].emit('eggsReady', {easterEggs:easterEggs});
        }
      }
    }
  });
},30000);