var mongoose = require('mongoose');
var Game = mongoose.model('Game');
var Player = mongoose.model('Player');
var __ = require('lodash');

exports.findGame = function(name, fn){
  Game.findOne({name:name}).populate('players').exec(function(err, game){
    fn(err, game);
  });
};

exports.newGame = function(name, fn){
  new Game({name:name}).save(function(err, game){
    Game.findById(game.id).populate('players').exec(function(err, game){
      fn(err, game);
    });
  });
};

exports.findPlayer = function(name, fn){
  Player.findOne({name:name}, function(err, player){
    fn(err, player);
  });
};

exports.newPlayer = function(name, color, fn){
  new Player({name:name, color:color}).save(function(err, player){
    fn(err, player);
  });
};

exports.resetPlayer = function(player, socket, fn){
  player.socketId = socket.id;
  player.save(function(err, player){
    fn(err, player);
  });
};

exports.updateCoordinates = function(player, x, y, fn){
  player.x = x;
  player.y = y;

  player.save(function(err, player){
    fn(err, player);
  });
};

exports.updateHealth = function(player, attacker, fn){
  // if(attacker.isZombie){
  //   player.isZombie = true;
  //   player.health = 0;
  // } else {
    var hit = __.sample([0,1,2,3,4,5,6,7,8,9,10]);
    player.health = player.health - hit;
    if(player.health <= 0 ){
      player.isZombie = true;
    // }
  }
  player.save(function(err,player){
    fn(err,player);
  });
};

exports.drinkPotion = function(player, potion, fn){
  // if(player.isZombie){
  //   player.isZombie = false;
  // }
  for(var i = 0; i < potion.length; i++){
    player.health = player.health + potion[i].healthBoost;
  }
  console.log(player.health);
  player.save(function(err,player){
    fn(err,player);
  });
};

exports.removePotion = function(game, potion, fn){
  for(var i = 0; i < potion.length; i++){
    var item = __.find(game.potions, function(p){return p.x === potion[i].y && p.x === potion[i].x && p.healthBoost === potion[i].healthBoost; });
    game.potions = __.without(game.potions, item);
    console.log(potion[i].x);
  }
  game.markModified('potions');
  game.save(function(err, game){
    fn(err, game);
  });
};

exports.attachPlayer = function(game, player, fn){
  game.players.push(player);
  game.save(function(err, game){
    fn(err, game);
  });
};

exports.emitPlayers = function(sockets, players, fn){
  for(var i = 0; i < players.length; i++){
    if(sockets[players[i].socketId]){
      sockets[players[i].socketId].emit('playerjoined', {players:players});
    }
  }
  fn();
};