enchant(); //the magic words that start enchant.js
//Stage Variables
var HEALTH = 5;

var triWidth = 100
var triHeight = 100;

var BOMB_WIDTH = 100; 
var BOMB_HEIGHT = 100;
var BOMB_COOLDOWN = 30; //in seconds

var EXPLOSION_WIDTH = 125;
var EXPLOSION_HEIGHT = 125;
var EXPLOSION_FRAMES = 5;
var EXPLOSION_ANIM_RATE = 4;

var STG_WIDTH = 1024;
var STG_HEIGHT = 768;
var FOOTERHEIGHT = 50;
var HEADERHEIGHT = 50; //The health bar block
var GAMESCREEN = STG_HEIGHT - HEADERHEIGHT - FOOTERHEIGHT;
var NUMLANES = 5;
var LANEHEIGHT = 6;
var HP_W = 341;

var RIGHT = 1;
var LEFT = -1;

var DEFAULT_SPEED = 20;
var SPAWN_RATE = 8;
var FRAME_RATE = 30
//------------------
//Global vars
var triangleList = [];
var powerupList = [];
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

Effect = Class.create(Sprite, {
   initialize: function(x, y, spriteWid, spriteHght, image, startFrame, endFrame, animationRate) {
      Sprite.call(this, spriteWid, spriteHght);
      this.x = x; 
      this.y = y;
      this.frame = startFrame;
      this.endFrame= endFrame;
      this.animRate = animationRate;
      this.image = image;
   },

   onenterframe: function() {
      if (this.age % this.animRate === 0) {
         this.frame++
         if (this.frame > this.endFrame) {
            game.rootScene.removeChild(this);
         }
      }
   }
});

Bomb = Class.create(Sprite, {
    initialize: function(laneNum, x, direction) {
       Sprite.call(this, BOMB_HEIGHT, BOMB_WIDTH);
       this.image = game.assets['powerup.png'];
       //this.frame = 0;
	   this.scale(direction, 1);
       this.x = x;
       this.y = HEADERHEIGHT + laneNum * GAMESCREEN/NUMLANES 
	            + GAMESCREEN/(NUMLANES * 2) - this.height / 2;
	   this.speed = DEFAULT_SPEED;
	   this.direction = direction;
    },

    onenterframe: function() {
        this.x += this.direction * this.speed;
        var id = -1;
        for (var triangleNdx = 0; triangleNdx < triangleList.length; triangleNdx++) {
           if (this.direction !== triangleList[triangleNdx].direction
               && this.intersect(triangleList[triangleNdx])) {

              id =  triangleList[triangleNdx].id;
              break;               
           }
        }

        // If there was a collision, kill all things of the same color
        if (id !== -1) {
            for (var triangleNdx = 0; triangleNdx < triangleList.length; triangleNdx++) {
               if (id === triangleList[triangleNdx].id) {
                    var curTri = triangleList[triangleNdx];
                    game.rootScene.addChild(new Effect(curTri.x, curTri.y, 
                                        EXPLOSION_WIDTH, 
                                        EXPLOSION_HEIGHT, 
                                        game.assets['exlposions.png'], id * EXPLOSION_FRAMES, 
                                        (id + 1) * EXPLOSION_FRAMES - 1, EXPLOSION_ANIM_RATE))

                    game.rootScene.removeChild(curTri);
                    triangleList.remove(triangleNdx);
                    triangleNdx--;
               }
            }
            game.rootScene.removeChild(this);
            powerupList.remove(powerupList.indexOf(this));
        }
        
    }

});

// Triangle Class
Triangle = Class.create(Sprite, {
    initialize: function(id, laneNum, x, direction) {
         Sprite.call(this, triWidth, triHeight);
         this.image = game.assets['tri1.png'];
         this.chime= game.assets['chime' + 1 + '.wav'];
		 this.scale(direction, 1);
         this.x = x;
         this.lane = laneNum;
         this.y = HEADERHEIGHT + laneNum * GAMESCREEN/NUMLANES 
			         + GAMESCREEN/(NUMLANES * 2) - this.image.height / 2;
		 this.speed = DEFAULT_SPEED;
		 this.direction = direction;
		 this.frame = id;
		 this.id = id;
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
                    && this.direction !== triangleList[triangleNdx].direction
                    && curTriIdx !== triangleNdx) {

                    leftTri = this.direction === LEFT ? this : triangleList[triangleNdx];
                    rightTri = this.direction === RIGHT ? this : triangleList[triangleNdx];

                    expX = leftTri.x - leftTri.width / 4;
                    effect = new Effect(expX, leftTri.y, 
                                        EXPLOSION_WIDTH, 
                                        EXPLOSION_HEIGHT, 
                                        game.assets['exlposions.png'], leftTri.id * EXPLOSION_FRAMES, 
                                        (leftTri.id + 1) * EXPLOSION_FRAMES - 1, EXPLOSION_ANIM_RATE)

                    game.rootScene.addChild(effect);

                    expX = rightTri.x + rightTri.width / 4;
                    effect = new Effect(expX, rightTri.y, 
                                        EXPLOSION_WIDTH, 
                                        EXPLOSION_HEIGHT, 
                                        game.assets['exlposions.png'], rightTri.id * EXPLOSION_FRAMES, 
                                        (rightTri.id + 1) * EXPLOSION_FRAMES - 1, EXPLOSION_ANIM_RATE)

                    game.rootScene.addChild(effect);

                    // If they're the same color
                    if (this.id !== triangleList[triangleNdx].id) {
                        //this.chime.play();
                        health--;
                    // If they're the same color
                    } else {
                        health++;
                    }

                    game.rootScene.removeChild(this);
                    game.rootScene.removeChild(triangleList[triangleNdx]);
                    triangleList.remove(triangleNdx);
                    curTriIdx = triangleList.indexOf(this);
                    triangleList.remove(curTriIdx);

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

    game.preload('tri1.png', 'lane.png', 'diamond-sheet.png', 'bg.png', 'chime1.wav', 
        'powerup.png', 'exlposions.png', 'healthBar.png', 'healthMask.png');
    game.fps = FRAME_RATE;

    game.onload = function() { //Prepares the game
        //01 Add Background
        bg = new Sprite(STG_WIDTH, STG_HEIGHT);
        bg.image = game.assets['bg.png'];
        game.rootScene.addChild(bg);
        
		for (var laneWire = 0; laneWire <= NUMLANES; laneWire++) {
			lanepos = HEADERHEIGHT + laneWire * GAMESCREEN/NUMLANES + GAMESCREEN/(NUMLANES * 2)
			         - LANEHEIGHT / 2;
         wire = new Lane(lanepos);
			game.rootScene.addChild(wire);
		}
		
		//Health Bar and Mask
      
		var healthBar = new Sprite(HP_W, HEADERHEIGHT);
      healthBar.image = game.assets['healthBar.png'];
      healthBar.x = 10;
      healthBar.y = 10;
      game.rootScene.addChild(healthBar);
      
      var healthMask = new Sprite(HP_W/10, HEADERHEIGHT);
      healthMask.image = game.assets['healthMask.png'];
      healthMask.scale(-3, 1);
      healthMask.x = 10 + HP_W - .1 * HP_W;
      healthMask.y = 10;
      healthMask.opacity = 0.65;
      game.rootScene.addChild(healthMask);
		
        //Game update
        game.rootScene.addEventListener('enterframe', function() {
            triSpawnTimer += frameTime;
			time++;
            startY = Math.floor(Math.random() * NUMLANES);

            //healthMask.scale(-10-health, 1);
			if (triSpawnTimer > 1 / SPAWN_RATE) {
				dir = Math.floor(Math.random() +  .5) ? LEFT : RIGHT;
				
                var laneSpaceExists = true;
                for (var triangleNdx = 0; triangleNdx < triangleList.length; triangleNdx++) {
                   // If they're not in the same lane
                   if (startY !== triangleList[triangleNdx].lane)
                      continue;

                     console.log("moo");
                   if (dir === RIGHT) {
                      if (triangleList[triangleNdx].direction === LEFT
                          && triangleList[triangleNdx].x < STG_WIDTH/ 3) {
                         console.log("Not spawning an arrow");
                         laneSpaceExists = false; break;
                      }
                   } else {
                      if (triangleList[triangleNdx].direction === RIGHT 
                          && triangleList[triangleNdx].x > STG_WIDTH * 2 / 3) {
                         console.log("Not spawning an arrow");
                         laneSpaceExists = false; break;

                      }
                   }
                }

                if (laneSpaceExists) {
                    startX = dir === RIGHT ? -triWidth: STG_WIDTH;
                    tri = new Triangle(Math.floor(Math.random() * 3), startY, startX, dir);
                    triangleList.push(tri);
                    game.rootScene.addChild(tri);
                    triSpawnTimer = 0;
                }
			}
            
            if (time % (FRAME_RATE * BOMB_COOLDOWN)  === 0) {
				dir = Math.floor(Math.random() +  .5) ? LEFT : RIGHT;
				startY = Math.floor(Math.random() * NUMLANES);
				startX = dir === RIGHT ? -BOMB_WIDTH: STG_WIDTH;
    
                var bomb = new Bomb(startY, startX, dir);
                powerupList.push(bomb);
                game.rootScene.addChild(bomb);
            }
        });

            

    }
    game.start(); 
}
