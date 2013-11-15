var mongoose = require('mongoose');
var Game = mongoose.model('Game');
var Player = mongoose.model('Player');
var __ = require('lodash');

exports.findGame = function(name, fn){
  console.log('---findGame---');
  Game.findOne({name:name}).populate('players').exec(function(err, game){
    fn(err, game);
  });
};

exports.newGame = function(name, fn){
  console.log('---newGame---');
  new Game({name:name}).save(function(err, game){
    Game.findById(game.id).populate('players').exec(function(err, game){
      fn(err, game);
    });
  });
};

exports.findPlayer = function(name, fn){
  console.log('---findPlayer---');
  Player.findOne({name:name}, function(err, player){
    fn(err, player);
  });
};

exports.newPlayer = function(name, character, fn){
  console.log('---newPlayer---');
  new Player({name:name, character:character}).save(function(err, player){
    fn(err, player);
  });
};

exports.resetPlayer = function(player, socket, fn){
  console.log('---resetPlayer---');
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


    if(attacker.hasAttackPotion){
      var hit = __.sample([0,1,2,3,4,5,6,7,8,9,10]);
      hit = hit + 800;
      player.health = player.health - hit;
      player.save(function(err,player){
        fn(err,player);
      });
    } else {
    var hit = __.sample([0,1,2,3,4,5,6,7,8,9,10]);
    player.health = player.health - hit;
    player.save(function(err,player){
      fn(err, player);
    });
  }
}


exports.drinkPotion = function(player, potion, fn){
  for (var i = 0; i < potion.length; i++) {
    if (potion[i].type === 'potion') {
      player.health = player.health + potion[i].healthBoost;
      player.save(function(err, player){
        fn(err, player);
      });
    };
    if (potion[i].type === 'attack') {
      player.hasAttackPotion = true;
      player.save(function(err, player){
        fn(err, player);
      });
    };
  };
}

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

exports.emitPlayers = function(sockets, players, player, fn){
  console.log('---emitPlayers---');
  for(var i = 0; i < players.length; i++){
    if(sockets[players[i].socketId]){
      sockets[players[i].socketId].emit('playerjoined', {players:players});
    }
  }
  fn();
};
