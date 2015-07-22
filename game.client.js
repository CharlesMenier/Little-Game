/**		GAME CLASS		**/
	
var game = function()
{
		//set the game size
	this.size = {
		width	: 720,
		height	: 480
	};
	
	this.maxPlayers = 10;
	
	this.kb = kb;//new keyboard();
	
		//init the local player and the distant player's array
	var startX = Math.round(Math.random()*(this.size.width-5)),
	startY = Math.round(Math.random()*(this.size.height-5));
	
	this.localPlayer 	= new player(startX, startY, this);
	this.otherPlayers 	= [];
	
		//Start listening for events
	this.setEventHandlers();
	
};

game.prototype.setEventHandlers	= function()
{
	
	this.socket = io();
	// Socket connection successful
	this.socket.on("connect", this.client_connect.bind(this));

	// Socket to change the username
	this.socket.on("setID", this.client_set_id.bind(this));
	
	// Socket to handle name error
	this.socket.on('error name', this.client_error_name.bind(this));
	
	// Socket disconnection
	this.socket.on("disconnect", this.client_disconnect.bind(this));

	// New player message received
	this.socket.on('new', this.client_new_player.bind(this));

	// Player move message received
	this.socket.on("move", this.client_move_player.bind(this));

	// Player removed message received
	this.socket.on("remove player", this.client_remove_player.bind(this));
	
	// Message received
	this.socket.on('message', this.client_message_received.bind(this));
	
	// Rocket created by other player
	this.socket.on('rocket', this.client_create_rocket.bind(this));
};

game.prototype.client_create_rocket = function(data)
{
	var p = this.getPlayer(data.id);
	if(!p)
	{
		console.log("Player does not exist : "+data.id);
		return;
	}
	
	p.createRocket(p.pos.x, p.pos.y, data.speed, data.direction);
};

game.prototype.client_message_received = function(data)
{
	var p = this.getPlayer(data.id);
	if(!p)
	{
		console.log("Player does not exist : "+data.id);
		return;
	}
	
	p.message = data.msg;
	setTimeout(function()
	{
		p.message = '';
		this.socket.emit('remove message', data.id);
	}, p.time);
};

game.prototype.client_connect = function()
{
	console.log("Player connected");
	this.socket.emit('request others');
};

game.prototype.client_set_id = function(data)
{
	if(this.getPlayer(data.id)) this.client_error_name(data);
	else
	{
		this.otherPlayers = [];
		this.localPlayer.id = data.id;
		this.socket.emit('new', {id:this.localPlayer.id, x:this.localPlayer.getX(), y:this.localPlayer.getY()});
		this.animate();
	}
}

game.prototype.client_error_name = function(data)
{
	alert("Le pseudo "+data.id+" est déjà utilisé.");
}

game.prototype.client_disconnect = function()
{
	this.socket.emit('disconnect', this.localPlayer.id);
	console.log("Player disconnect");
};

game.prototype.client_new_player = function(data)
{
	console.log("New player connected : "+ data.id);
	
	var newP = new player(data.x, data.y, this);
	newP.id = data.id;
	this.otherPlayers.push(newP);
};

game.prototype.client_remove_player = function(data)
{
	var playerToRemove = this.getPlayer(data.id);
	if(!playerToRemove)
	{
		console.log("Player does not exist : "+data.id);
		return;
	}
	
	this.otherPlayers.splice(this.otherPlayers.indexOf(playerToRemove), 1);
};

game.prototype.client_move_player = function(data)
{
	var playerToMove = this.getPlayer(data.id);
	if(!playerToMove)
	{
		console.log("Player does not exist : "+data.id);
		return;
	}
	
	//playerToMove.setX(data.x);
	//playerToMove.setY(data.y);
	playerToMove.setPos(data.x, data.y);
};

game.prototype.draw = function()
{
	this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
	this.ctx.fillStyle = 'lightblue';
	this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
	this.ctx.fillStyle = 'red';
	this.localPlayer.draw(this.ctx);
	
	for(var i = 0; i < this.otherPlayers.length; ++i)
	{
		this.otherPlayers[i].draw(this.ctx);
	}
}

game.prototype.getPlayer = function(id)
{
	for(var i = 0; i < this.otherPlayers.length; ++i)
	{
		if(this.otherPlayers[i].id === id)
			return this.otherPlayers[i];
	}
	
	return false;
};

game.prototype.update = function()
{
	// Update local player and check for change
	if (this.localPlayer.update(this.kb)) {
		//console.log("sending movement...");
		// Send local player data to the game server
		this.socket.emit("move", {id: this.localPlayer.id, x: this.localPlayer.getX(), y: this.localPlayer.getY()});
	}
};

game.prototype.animate = function()
{
	//console.log(this.otherPlayers);
	this.update();
	this.draw();
	window.requestAnimationFrame(this.animate.bind(this));
};
















