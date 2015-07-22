/**	KEYBOARD CLASS	**/

/* constructor*/
keyboard 	= function()
{
	var self = this;
	
	self.keyCodes 	= {
		37		: false,
		38		: false,
		39		: false,
		40		: false,
		32		: false
	};
	
	self.ALIAS		= {
		'left'	: 37,
		'up'	: 38,
		'right'	: 39,
		'down'	: 40,
		'space'	: 32
	};
	
	this._onKeyDown	= function(event){ self._onKeyChange(event, true); };
	this._onKeyUp	= function(event){ self._onKeyChange(event, false);};

	// bind keyEvents
	document.addEventListener("keydown", this._onKeyDown, false);
	document.addEventListener("keyup", this._onKeyUp, false);
}

keyboard.prototype._onKeyChange	= function(event, pressed)
{
	//set the key pressed to true or false	
	var keyCode				= event.keyCode;
	if(this.keyCodes.hasOwnProperty(keyCode))
		this.keyCodes[keyCode]	= pressed;
}

var kb 	= new keyboard() || {};