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
var LANEHEIGHT = 6;

var GREEN = 0;
var BLUE = 1;
var PURPLE = 2;

var RIGHT = 1;
var LEFT = -1;

var DEFAULT_SPEED = 20;
var SPAWN_RATE = 2;
var FRAME_RATE = 30
//------------------
//Global vars
var triangleList = [];
var health = 10;
var healthLabel = new Label("Health" + health);
var time = 0;
var triSpawnTimer = 0;
var frameTime = 1 / FRAME_RATE;

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

Lane = Class.create(Sprite, {
   initialize: function(y) {
      Sprite.call(this, STG_WIDTH * 2, LANEHEIGHT);
      var laneImg = game.assets['lane.png'];
      this.y = y;
      this.x = Math.floor(Math.random() * STG_WIDTH) - STG_WIDTH;
      this.image = laneImg;
   },
   
   onenterframe: function() {
      this.x = (this.x - 40) % STG_WIDTH;
   }

});

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
		 this.color = color;
    },

    onenterframe: function() {
        this.x += this.direction * this.speed;

        var curTriIdx = triangleList.indexOf(this);
		if (this.x < (-1 * this.width) || this.x > (STG_WIDTH + this.width)) {
			game.rootScene.removeChild(this);
            triangleList.splice(curTriIdx, curTriIdx);
		} else {
            for (var triangleNdx = 0; triangleNdx < triangleList.length; triangleNdx++) {
                if (this.intersect(triangleList[triangleNdx]) 
                    && triangleList[triangleNdx] !== this
                    && curTriIdx !== triangleNdx) {

                    console.log("Removing item at " + triangleNdx + " and " + curTriIdx);
                    game.rootScene.removeChild(this);
                    game.rootScene.removeChild(triangleList[triangleNdx]);
                    triangleList.remove(triangleNdx);
                    curTriIdx = triangleList.indexOf(this);
                    triangleList.remove(curTriIdx);
                    console.log("Triangle list length is " + triangleList.length);

                    health--;
                    break;
                }
            }
        }
		
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
    game.fps = FRAME_RATE;

    game.onload = function() { //Prepares the game
        //01 Add Background
        bg = new Sprite(STG_WIDTH, STG_HEIGHT);
        bg.image = game.assets['bg.png'];
        game.rootScene.addChild(bg);
        
		//var laneImg = game.assets['lane.png'];
		for (var laneWire = 0; laneWire <= NUMLANES; laneWire++) {
			lanepos = HEADERHEIGHT + laneWire * GAMESCREEN/NUMLANES + GAMESCREEN/(NUMLANES * 2)
			         - LANEHEIGHT / 2;
         wire = new Lane(lanepos);
			game.rootScene.addChild(wire);
		}
		
		//Health label
        
		healthLabel.color = "white";
		healthLabel.font = "48px monospace";
		game.rootScene.addChild(healthLabel);
		
        //Game update
        game.rootScene.addEventListener('enterframe', function() {
            triSpawnTimer += frameTime;
			time++;
            healthLabel.text = "Health" + health;
			if (triSpawnTimer > 1 / SPAWN_RATE) {
				dir = Math.floor(Math.random() +  .5) ? LEFT : RIGHT;
				
				startX = dir === RIGHT ? -triWidth: STG_WIDTH;
				startY = Math.floor(Math.random() * NUMLANES);
				tri = new Triangle(Math.floor(Math.random() * 3), 0, startX, dir);
				triangleList.push(tri);
				game.rootScene.addChild(tri);
                triSpawnTimer = 0;
			}
        });

    }
    game.start(); 
}
