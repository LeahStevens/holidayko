/* global getValue, document, window, io */

$(document).ready(initialize);

var socket;
var game;
var player;
var players;
var easterEggs;

function initialize(){
  $(document).foundation();
  initializeSocketIO();
  $('#start').on('click', clickStart);
  $('body').on('keyup', keyupMove);
}

function keyupMove(e){
  var isArrow = _.any([37, 38, 39, 40], function(i){return i === e.keyCode;});
  if(e.keyCode === 72){
    var attacked = _.sample(findPrey());
    socket.emit('attack', {game: game, attacker: player, prey: attacked.name});
  }

  if(isArrow){
    var p = findPlayer();

    switch(e.keyCode){
      case 38:
        p.y--;
        break;
      case 40:
        p.y++;
        break;
      case 37:
        p.x--;
        break;
      case 39:
        p.x++;
        break;
    }
    socket.emit('playermoved', {game:game, player:player, x:p.x, y:p.y});
    var potion = findPotions();
    if(potion.length){
      socket.emit('playerdrinkpotion', {game:game, player:player, potion:potion});
      socket.emit('removepotion', {game:game, potion:potion});
    }
  }
}

function clickStart(){
  $('#board tr').remove();
  game = $('#worlds :selected').text();
  var character = $('#characters :selected').text();
  player = getValue('#player');
  socket.emit('startgame', {game:game, player:player, character:character});
  htmlAddBoard();
  if(game === 'Christmas Town') {
    $('body').css('background', 'url(../images/christmasbackground2.jpg)').css('background-repeat', 'no-repeat').css('background-size', 'cover');
  }
  if(game === "St Patrick's Pub") {
    $('body').css('background', 'url(../images/stpattybackground1.gif)').css('background-repeat', 'no-repeat').css('background-size', 'cover');
  }
  if(game === "Cupid's Love Shack") {
    $('body').css('background', 'url(../images/valentinebackground.jpg)').css('background-repeat', 'no-repeat').css('background-size', 'cover');
  }
  if(game === 'Easter Land') {
    $('body').css('background', 'url(../images/easterbackground1.jpg)').css('background-repeat', 'no-repeat').css('background-size', 'cover');
  }
  if(game === 'Halloween Town') {
    $('body').css('background', 'url(../images/halloweenbackground2.jpeg)').css('background-repeat', 'no-repeat').css('background-size', 'cover');
  }
  if(game === "Uncle Sam's Lair") {
    $('body').css('background', 'url(../images/whitehouse.jpg)').css('background-repeat', 'no-repeat').css('background-size', 'cover');
  }

}

// ------------------------------------------------------------------------ //
// ------------------------------------------------------------------------ //
// ------------------------------------------------------------------------ //

function findPlayer() {
  return _.find(players, function(p){return p.name === player;});
}

function findPrey() {
  var predator = findPlayer();
  return _.filter(players, function(prey) { return prey.x === predator.x && prey.y === predator.y && prey.name !== predator.name; });
}

function findPotions() {
  var player = findPlayer();
  return _.filter(easterEggs, function(p) { return p.x === player.x && p.y === player.y});
}

// ------------------------------------------------------------------------ //
// ------------------------------------------------------------------------ //
// ------------------------------------------------------------------------ //

function initializeSocketIO(){
  var port = window.location.port ? window.location.port : '80';
  var url = window.location.protocol + '//' + window.location.hostname + ':' + port + '/app';

  socket = io.connect(url);
  socket.on('connected', socketConnected);
  socket.on('playerjoined', socketPlayerJoined);
  socket.on('eggsReady', socketEggsReady);
  socket.on('playerdrinkpotion', socketPlayerDrinkPotion);
}

function socketConnected(data){
  console.log(data);
}

function socketEggsReady(data){
  console.log(data);
  easterEggs = data.easterEggs;
  htmlAddEggs(easterEggs);
}

function socketPlayerJoined(data){
  console.log(data);
  players = data.players;
  $('#board tr').remove();
  htmlAddBoard();
  htmlAddPlayers(data);
}

function socketPlayerDrinkPotion(data){
  // console.log(data);
  players = data.players;
  $('#board tr').remove();
  htmlAddBoard();
  htmlAddPlayers(data);
}

// ------------------------------------------------------------------------ //
// ------------------------------------------------------------------------ //
// ------------------------------------------------------------------------ //


function htmlAddBoard() {
  for(var i = 0; i < 10; i++){
    var tr = '<tr data-y="' + [i] + '"><td data-x="0" data-y="' + [i] + '"></td><td data-x="1" data-y="' + [i] + '"></td><td data-x="2" data-y="' + [i] + '"></td><td data-x="3" data-y="' + [i] + '"></td><td data-x="4" data-y="' + [i] + '"></td><td data-x="5" data-y="' + [i] + '"></td><td data-x="6" data-y="' + [i] + '"></td><td data-x="7" data-y="' + [i] + '"></td><td data-x="8" data-y="' + [i] + '"></td><td data-x="9" data-y="' + [i] + '"></td></tr>';
    $('#board').append(tr);
  }
}

function htmlAddPlayers(data){
$('#hp-status div').remove();
  for(var i = 0; i < data.players.length; i++){
    if(data.players[i].health > 0){
      var $td = $('#board td[data-x="' + data.players[i].x + '"][data-y="' + data.players[i].y + '"]');
      if(data.players[i].character === 'Santa Claus'){
        $td.addClass('santa').attr('data-name', data.players[i].name);
      }
      if(data.players[i].character === 'Cupid'){
        $td.addClass('cupid').attr('data-name', data.players[i].name);
      }
      if(data.players[i].character === 'Easter Bunny'){
        $td.addClass('easterbunny').attr('data-name', data.players[i].name);
      }
      if(data.players[i].character === 'Leprechaun'){
        $td.addClass('leprechaun').attr('data-name', data.players[i].name);
      }
      if(data.players[i].character === 'Jack O Lantern'){
        $td.addClass('pumpkin').attr('data-name', data.players[i].name);
      }
      if(data.players[i].character === 'Uncle Sam'){
        $td.addClass('sam').attr('data-name', data.players[i].name);
      }
    }
  }

  var user = _.find(players, function(p){return p.name === player});

  for(var x = 0; x < user.health; x++){
    var $health = $('<div>').addClass('health');
    $('#hp-status').append($health);
  }

    // if(data.players[i].isZombie){
    //   var $zombie = $('#board td[data-x="' + data.players[i].x + '"][data-y="' + data.players[i].y + '"]');
    //   var $death = $('<div>').addClass('health');
    //   $death.css('background-color', data.players[i].color);
    //   $death.css('width', data.players[i].health + '%');
    //   $zombie.addClass('zombie');
    // }
  if(easterEggs.length){
    htmlAddEggs(easterEggs);
  }
}



function htmlAddEggs(easterEggs) {
  $('#board td').removeClass('potion');
  $('#board td').removeClass('attack');
  $('#board td').removeClass('quicksand');

  for(var i = 0; i < easterEggs.length; i++){
    var $td = $('#board td[data-x="' + easterEggs[i].x + '"][data-y="' + easterEggs[i].y + '"]');
    if (easterEggs[i].type === 'potion') {
      $td.addClass('potion');
    }

      if (easterEggs[i].type === 'attack') {
        $td.addClass('attack');
    }

        if (easterEggs[i].type === 'quicksand') {
          $td.addClass('quicksand');
    }

  }
}