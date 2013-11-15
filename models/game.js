var mongoose = require('mongoose');
var __ = require('lodash');

var Game = mongoose.Schema({
  name: String,
  players: [{type: mongoose.Schema.Types.ObjectId, ref: 'Player'}],
  easterEggs: [{}],
  createdAt: {type: Date, default: Date.now}
});

mongoose.model('Game', Game);