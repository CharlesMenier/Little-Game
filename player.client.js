/**		PLAYER CLASS	**/
var socket = io();
var player = function(startX, startY, instance)
{
	this.game = instance;
	this.pos = { x : startX, y : startY };	
	this.id = 'Roger';							//default id
	this.speed	= 2;
	this.size 	= { x:10, y:10 };
	this.message = '';							//current message
	this.time = 5000;							//time during which the messages are displayed
	this.lastMove = { x:1, y:0 };				//default last move is right 
	this.rockets = [];
	this.shotSpeed = 400;
	this.timer = Date.now();
};

var rocket = function(x, y, speed, dir)
{
	this.pos = { x:x, y:y };
	this.size = { x:4, y:4 };
	this.speed = speed;
	this.direction = { x: dir.x, y: dir.y };
};

player.prototype.getX = function() { return this.pos.x; };
player.prototype.getY = function() { return this.pos.y; };
player.prototype.setX = function(newX) { this.pos.x = newX };
player.prototype.setY = function(newY) { this.pos.y = newY };
player.prototype.setPos = function(x, y) { this.setX(x); this.setY(y); };
	
player.prototype.update = function( kb )
{
	var oldX = this.pos.x;
	var oldY = this.pos.y;
	
	if(kb.keyCodes[kb.ALIAS['up']]) 		this.pos.y -= this.speed;
	else if(kb.keyCodes[kb.ALIAS['down']])	this.pos.y += this.speed;
	
	if(kb.keyCodes[kb.ALIAS['left']]) 		this.pos.x -= this.speed;
	else if(kb.keyCodes[kb.ALIAS['right']])	this.pos.x += this.speed;
	
	var dir = { x : (this.pos.x - oldX)/this.speed, y : (this.pos.y - oldY)/this.speed };
	//if there is no movement, last movement is used for the rockets
	if(dir.x !== 0 || dir.y !== 0) 			this.lastMove = { x: dir.x, y: dir.y };
	if(dir.x === 0 && dir.y === 0) 			dir = { x: this.lastMove.x, y: this.lastMove.y };
	
	if(kb.keyCodes[kb.ALIAS['space']])		this.createRocket(this.pos.x, this.pos.y, 5, dir);
	
	return (oldX != this.pos.x || oldY != this.pos.y) ? true : false;
	
};

player.prototype.createRocket = function(x, y, speed, dir)
{
	if(Date.now() - this.timer >= this.shotSpeed)
	{
		var newR = new rocket(this.pos.x, this.pos.y, speed, dir);
		this.rockets.push(newR);
		this.timer = Date.now();
		socket.emit('rocket', { id: this.id, direction: dir, speed: speed })
	}
	
};
	
player.prototype.draw = function(ctx) 
{ 
	ctx.fillRect(this.pos.x - this.size.x/2, this.pos.y - this.size.y/2, this.size.x, this.size.y);
	ctx.fillStyle = '#FEA100';
	ctx.fillText(this.id, this.pos.x + 5, this.pos.y - 5);
	//console.log(this.lastMove);
	for(var i = 0; i < this.rockets.length; ++i)
	{
		var rocket = this.rockets[i];
		rocket.pos.x += rocket.direction.x * (rocket.speed);
		rocket.pos.y += rocket.direction.y * (rocket.speed);
		ctx.fillStyle = 'black';
		ctx.fillRect(rocket.pos.x - rocket.size.x/2, rocket.pos.y - rocket.size.y/2, rocket.size.x, rocket.size.y);
	}
	
	if(this.message !== '')
	{
		var self = this;
		ctx.fillStyle = '#686868';
		ctx.fillText(this.message, this.pos.x, this.pos.y - 20);
		setTimeout(function()
		{
			self.message = '';
			socket.emit('remove message', self.id);
		}, self.time);
	}
		
};