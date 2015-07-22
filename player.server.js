/**************************************************
** GAME PLAYER CLASS
**************************************************/
var player = function(startX, startY)
{
	this.pos	= {	x : startX, y : startY };
	this.id = 'Roger';
	this.speed	= 2;
	this.size 	= { x:10, y:10 };
};

player.prototype.getX = function() { return this.pos.x; };
player.prototype.getY = function() { return this.pos.y; };

player.prototype.setX = function(newX) { this.pos.x = newX };
player.prototype.setY = function(newY) { this.pos.y = newY };

player.prototype.setPos = function(x, y) { this.setX(x); this.setY(y); };

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.player = player;