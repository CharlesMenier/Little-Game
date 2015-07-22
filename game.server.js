var app 	= require('express')();
var http 	= require('http').Server(app);
var io 		= require('socket.io')(http);
var UUID	= require('node-uuid');
//var player 	= require('player').player;







var player = function(startX, startY)
{
	this.pos	= {	x : startX, y : startY };
	this.id = 'Roger';
	this.speed	= 2;
	this.size 	= { x:10, y:10 };
	this.message = '';
	this.time = 3000;
};

player.prototype.getX = function() { return this.pos.x; };
player.prototype.getY = function() { return this.pos.y; };

player.prototype.setX = function(newX) { this.pos.x = newX };
player.prototype.setY = function(newY) { this.pos.y = newY };

player.prototype.setPos = function(x, y) { this.setX(x); this.setY(y); };

	//create a circle in the canvas
function fillCircle(x, y, r)
{
  var canvas = document.getElementById("canvas2");
  var context = canvas.getContext("2d");
  context.beginPath();
  context.fillStyle="#FF4422"
  context.arc(x, y, r, 0, 2 * Math.PI);
  context.fill();
}

var bonus = function()
{
	//this.
	this.type;
	this.value;
	
};











var players = [];
var messages = [];
var bonuses = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get( '/*' , function( req, res, next ) {

            //This is the current file they have requested
        var file = req.params[0];

            //For debugging, we can track what files are requested.
        console.log('\t :: Express :: file requested : ' + file);

            //Send the requesting client the file.
        res.sendFile( __dirname + '/' + file );

}); //app.get *

io.on('connection', function(client)
{
	
	client.on('username', function(data){
		client.emit('setID', {id:data});
		client.id = data;
	});
	
	client.on('request others', function()
	{
		var i, existingPlayer;
		for (i = 0; i < players.length; i++) {
			existingPlayer = players[i];
			client.emit("new", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});
		};
	});
	
		//add new player
	client.on('new', function(data)
	{
		var newPlayer = new player(data.x, data.y);
		newPlayer.id = data.id;

		client.broadcast.emit("new", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()});

		var i, existingPlayer;
		for (i = 0; i < players.length; i++) {
			existingPlayer = players[i];
			client.emit("new", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});
		};
		players.push(newPlayer);
	});
	
		//when a player move
	client.on('move', function(data){
		
		var movePlayer = getPlayer(data.id);
		if (!movePlayer) {
			console.log("Player not found: "+data.id);
			return;
		};

		movePlayer.setPos(data.x, data.y);
		client.broadcast.emit("move", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()});
	});
	
	client.on('rocket', function(data)
	{
		client.broadcast.emit('rocket', data);
	});
	
	client.on('disconnect', function(id)
	{
		var removePlayer = getPlayer(this.id);

		if (!removePlayer) {
			console.log("Player not found: "+this.id);
			return;
		};

		players.splice(players.indexOf(removePlayer), 1);
		client.broadcast.emit("remove player", {id: this.id});
	});
	
	client.on('message', function(data)
	{
		var p = getPlayer(data.id);
		if (!p) {
			console.log("Player not found: "+data.id);
			return;
		};
		console.log(data);
		p.message = data.msg;
		messages.push(data.msg);
		client.broadcast.emit('message', { id: p.id, msg: data.msg } );		
	});
	
	client.on('remove message', function(id)
	{
		var p = getPlayer(id);
		if (!p) {
			console.log("Player not found: "+id);
			return;
		};
		
		var msg = p.message;
		p.message = '';
		messages.splice(messages.indexOf(msg), 1);
	});
	
	
	
	
});

var getPlayer = function(id)
{
	for(var i = 0; i < players.length; ++i)
	{
		if(players[i].id === id)
			return players[i];
	}
	return false;
};

http.listen(3000, function()
{
  console.log('listening on *:3000');
});
