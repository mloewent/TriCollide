enchant(); //the magic words that start enchant.js
//Stage Variables

var HEALTH = 5;

var triWidth = 100
var triHeight = 100;

var STG_WIDTH = 1024;
var STG_HEIGHT = 768;
var FOOTERHEIGHT = 50;
var HEADERHEIGHT = 50; //The health bar block
var GAMESCREEN = STG_HEIGHT - HEADERHEIGHT - FOOTERHEIGHT;
var NUMLANES = 5;

var GREEN = 0;
var BLUE = 1;
var PURPLE = 2;

var RIGHT = 1;
var LEFT = -1;

var DEFAULT_SPEED = 2;

//02 Triangle Class
Triangle = Class.create(Sprite, {
    initialize: function(color, laneNum, x, direction) {
         Sprite.call(this, triWidth, triHeight);
         this.image = game.assets['tri1.png'];
		 this.scale(direction, 1);
         this.x = x;
         this.y = HEADERHEIGHT + laneNum * GAMESCREEN/NUMLANES 
			         + GAMESCREEN/(NUMLANES * 2) - this.image.height / 2;
		 this.speed = DEFAULT_SPEED;
		 this.direction = direction;
		 this.frame = color;
        //03 Bind Keys
        
        //04 Mouse Variables
    },

    onenterframe: function() {
        this.x += (this.direction) * this.speed;
        //03 Triangle Controls
        
        //04 Mouse Update
    },
	
	ontouchmove: function(e) {
		
		// Checks if triangle is in gamescreen
		if (e.y >= HEADERHEIGHT && e.y <= STG_HEIGHT - FOOTERHEIGHT) {
			//snap on
			var lane = Math.floor((e.y - HEADERHEIGHT)/(GAMESCREEN/NUMLANES));
			this.y = HEADERHEIGHT + lane * GAMESCREEN/NUMLANES 
			         + GAMESCREEN/(NUMLANES * 2) - this.image.height / 2;
		}
	}
	
});

//Begin game code
window.onload = function() {
    game = new Game(STG_WIDTH, STG_HEIGHT);
    //Preload images
    //Any resources not preloaded will not appear
    game.preload('tri1.png', 'lane.png', 'diamond-sheet.png', 'bg.png');

    game.onload = function() { //Prepares the game
        //01 Add Background
        bg = new Sprite(STG_WIDTH, STG_HEIGHT);
        bg.image = game.assets['bg.png'];
        game.rootScene.addChild(bg);
        
		var laneImg = game.assets['lane.png'];
		for (var laneWire = 0; laneWire <= NUMLANES; laneWire++) {
			wire = new Sprite(laneImg.width, laneImg.height);
			wire.image = laneImg;
			game.rootScene.addChild(wire);
			wire.y = HEADERHEIGHT + laneWire * GAMESCREEN/NUMLANES + GAMESCREEN/(NUMLANES * 2)
			         - wire.image.height / 2;
		}
		
        //02 Add Triangle
		for (var numTris = 0; numTris < 10; numTris++)
		{
			tri = new Triangle((numTris%3), Math.floor(Math.random() * NUMLANES),
				Math.floor(Math.random() * STG_WIDTH), ((numTris%2) ? 1 : -1));
			game.rootScene.addChild(tri);
		}
        
        //Game Condition Check
        game.rootScene.addEventListener('enterframe', function() {
            //08 Game Over
            
        });

    }
    game.start(); //Begin the game
}
