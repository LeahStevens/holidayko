var mongoose = require('mongoose');
var __ = require('lodash');

var Game = mongoose.Schema({
  name: String,
  players: [{type: mongoose.Schema.Types.ObjectId, ref: 'Player'}],
  potions: [{}],
  walls: [{}],
  createdAt: {type: Date, default: Date.now}
});

mongoose.model('Game', Game);