var mongoose = require('mongoose');
var __ = require('lodash');

function randomize(){
  return __.sample(__.range(10));
}

var Player = mongoose.Schema({
  name     : String,
  character: String,
  socketId : String,
  x: {type : Number, default: randomize},
  y: {type : Number, default: randomize},
  health   : {type: Number, default: 100},
  hasAttackPotion: {type: Boolean, default:false},
  createdAt: {type: Date, default: Date.now}
});

mongoose.model('Player', Player);