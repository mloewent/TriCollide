enchant(); //the magic words that start enchant.js
//Stage Variables
var HEALTH = 5;

var triWidth = 125;
var triHeight = 125;

var BOMB_WIDTH = 100; 
var BOMB_HEIGHT = 100;
var BOMB_COOLDOWN = 10; //in seconds

var WALL_WIDTH = 150; 
var WALL_HEIGHT = 100;
var WALL_COOLDOWN = 5; //in seconds

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
var HP_MAX = 10;

var SCOREX = 300;

var RIGHT = 1;
var LEFT = -1;

var NUM_COLORS = 4;

var DEFAULT_SPEED = 8;
var MAX_SPEED = 16;
var SPEED_RATE_INCR = .015;
var SPAWN_RATE = 2;
var SPAWN_RATE_INCR = .03;
var FRAME_RATE = 30
//------------------
//Global vars
var triangleList = [];
var powerupList = [];
var health = 5;
var healthLabel = new Label("Health: " + health);
healthLabel.font = "48px Monospace"
healthLabel.color = "white"
var wallList = [];
var time = 0;
var triSpawnTimer = 0;
var frameTime = 1 / FRAME_RATE;
var score = 0;
var scoreLabel = new Label("Score : " + score);

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

var chime = new Howl({
  urls: ['chime1.wav']
});

var bgMusic = new Howl({
  urls: ['bgmusic.mp3'],
  loop: true
});


Wall = Class.create(Sprite, {
    initialize: function(laneNum, x, direction, color) {
       Sprite.call(this, WALL_WIDTH, WALL_HEIGHT);
       this.image = game.assets['wall.png'];
	   this.color = color;
	   this.frame = color;
       this.x = x;
       this.y = HEADERHEIGHT + laneNum * GAMESCREEN/NUMLANES 
	            + GAMESCREEN/(NUMLANES * 2) - this.height / 2;
	   this.speed = DEFAULT_SPEED;
       this.scaleX = direction;
	   this.direction = direction;
    },

    onenterframe: function() {
        this.x += this.direction * this.speed;

        for (var triangleNdx = 0; triangleNdx < triangleList.length; triangleNdx++) {
           if (this.intersect(triangleList[triangleNdx]) && (this.color === triangleList[triangleNdx].id)) {
				if (time % 3 === 0) {
					chime.play();
				}
                if (time % FRAME_RATE === 0) {
                    if (health < 10) {
                        health++;
                    }
                }
				break;               
           } else if (this.intersect(triangleList[triangleNdx])) {
				expX = (this.x + triangleList[triangleNdx].x) / 2;
                effect = new Effect(expX, this.y, 
                                    EXPLOSION_WIDTH, 
                                    EXPLOSION_HEIGHT, 
                                    game.assets['exlposions.png'], triangleList[triangleNdx].id * EXPLOSION_FRAMES, 
                                    (triangleList[triangleNdx].id + 1) * EXPLOSION_FRAMES - 1, EXPLOSION_ANIM_RATE)

                game.rootScene.addChild(effect);
                
                health--;
                game.rootScene.removeChild(triangleList[triangleNdx]);
                triangleList.remove(triangleNdx);
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
		if (this.x < (-1 * this.width) || this.x > (STG_WIDTH + this.width)) {
			game.rootScene.removeChild(this);
            wallList.remove(wallList.indexOf(this));
        }
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

// Triangle Class
Triangle = Class.create(Sprite, {
    initialize: function(id, laneNum, x, direction) {
         Sprite.call(this, triWidth, triHeight);
         this.image = game.assets['tri1.png'];
         this.explosion = game.assets['failBuzzer.wav'];
         this.chime = game.assets['chime' + id + '.wav'];
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
                        this.explosion.play();
                        health--;
                    // If they're the same color
                    } else {
                        if (health < HP_MAX) {
                           health++;
                           this.chime.play();
                        } 
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
runGame = function(isMobile) {
    if (isMobile)
    {
        STG_WIDTH = 1600;
        STG_HEIGHT = 720;
        scoreLabel.text = "Mobile Device Detected!";
        NUMLANES = 4;
    }
    game = new Game(STG_WIDTH, STG_HEIGHT);
    //Preload images
    //Any resources not preloaded will not appear

    game.preload('tri1.png', 'lane.png', 'bg.png', 'chime1.wav', 
        'powerup.png', 'exlposions.png', 'healthBar.png', 'healthMask.png', 
        'chime0.wav', 'chime2.wav', 'chime3.wav', 'failBuzzer.wav', 'gameOver.wav', 'wall.png', 'bgmusic.mp3');
    game.fps = FRAME_RATE;

    game.onload = function() { //Prepares the game
        //01 Add Background
        bg = new Sprite(STG_WIDTH, STG_HEIGHT);
        bgMusic.play();
        bg.image = game.assets['bg.png'];
        game.rootScene.addChild(bg);
        
		for (var laneWire = 0; laneWire <= NUMLANES; laneWire++) {
			lanepos = HEADERHEIGHT + laneWire * GAMESCREEN/NUMLANES + GAMESCREEN/(NUMLANES * 2)
			         - LANEHEIGHT / 2;
         wire = new Lane(lanepos);
			game.rootScene.addChild(wire);
		}
		
		
		scoreLabel.x = STG_WIDTH - SCOREX;
		scoreLabel.font = "36px Comic Sans MS";
		scoreLabel.color = "white";
		game.rootScene.addChild(scoreLabel);
		//Health Bar and Mask
      
      /*var healthBar = new Sprite(HP_W, HEADERHEIGHT);
      healthBar.image = game.assets['healthBar.png'];
      healthBar.x = 10;
      healthBar.y = 10;
      game.rootScene.addChild(healthBar);
      
      var healthMask = new Sprite(HP_W, HEADERHEIGHT);
      healthMask.image = game.assets['healthMask.png'];
      healthMask.scale(.5, 1);
      healthMask.x = 10 + HP_W * .25;
      healthMask.y = 10;
      healthMask.opacity = 0.65;
      //game.rootScene.addChild(healthMask);*/
      game.rootScene.addChild(healthLabel);

      var healthUpdate = health;
		
      //Game update
      game.rootScene.addEventListener('enterframe', function() {
         triSpawnTimer += frameTime;
         time++;
         startY = Math.floor(Math.random() * NUMLANES);

         if (health <= 0) {
            bgMusic.mute();
            game.assets['gameOver.wav'].play();
            game.end();
         }

         healthLabel.text = "Health: " + health;
         /*if (health != healthUpdate) {
            healthMask.image = game.assets['healthMask.png'];
            healthMask.x = 0;
            healthMask.y = 0;
            healthMaskXScale = (HP_MAX - health) / HP_MAX;
            console.log("Health scale is " + healthMaskXScale);

            healthMask.scaleX = healthMaskXScale;
            healthMask.x = 10 + (1 - healthMaskXScale) * HP_W;
            healthMask.y = 10;
            healthUpdate = health;
         }*/
			if (triSpawnTimer > 1 / SPAWN_RATE) {
				dir = Math.floor(Math.random() +  .5) ? LEFT : RIGHT;
				
                var laneSpaceExists = true;
                for (var triangleNdx = 0; triangleNdx < triangleList.length; triangleNdx++) {
                   // If they're not in the same lane
                   if (startY !== triangleList[triangleNdx].lane)
                      continue;

                   if (dir === RIGHT) {
                      if (triangleList[triangleNdx].direction === LEFT
                          && triangleList[triangleNdx].x < STG_WIDTH/ 3) {
                         laneSpaceExists = false; break;
                      }
                   } else {
                      if (triangleList[triangleNdx].direction === RIGHT 
                          && triangleList[triangleNdx].x > STG_WIDTH * 2 / 3) {
                         laneSpaceExists = false; break;

                      }
                   }
                }

                if (laneSpaceExists) {
                    startX = dir === RIGHT ? -triWidth: STG_WIDTH;
                    tri = new Triangle(Math.floor(Math.random() * NUM_COLORS), startY, startX, dir);
                    triangleList.push(tri);
                    game.rootScene.addChild(tri);
                }
                triSpawnTimer = 0;
			}
            
            if (time % (FRAME_RATE * BOMB_COOLDOWN)  === 0) {
				dir = Math.floor(Math.random() +  .5) ? LEFT : RIGHT;
				startY = Math.floor(Math.random() * NUMLANES);
				startX = dir === RIGHT ? -BOMB_WIDTH: STG_WIDTH;
    
                var bomb = new Bomb(startY, startX, dir);
                powerupList.push(bomb);
                game.rootScene.addChild(bomb);
            }
			
			
			if (time % 3 === 0) {
               score++;
            }

			scoreLabel.text = "Score : " + score;
			
            if (time % (FRAME_RATE * WALL_COOLDOWN)  === 0) {
				dir = Math.floor(Math.random() +  .5) ? LEFT : RIGHT;
				startY = Math.floor(Math.random() * NUMLANES);
				startX = dir === RIGHT ? -WALL_WIDTH: STG_WIDTH;
    
                var wall = new Wall(startY, startX, dir, Math.floor(Math.random() * NUM_COLORS));
                wallList.push(bomb);
                game.rootScene.addChild(wall);
            }
            if (time % FRAME_RATE === 0)
               SPAWN_RATE += SPAWN_RATE_INCR;
               if (DEFAULT_SPEED < MAX_SPEED) {
                  DEFAULT_SPEED += SPEED_RATE_INCR;
               }
        });

    }
    game.start(); 
}
