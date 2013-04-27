enchant(); //the magic words that start enchant.js
//Stage Variables
var moveSpeed = 4;
var health = 5;
var stgWidth = 320;
var stgHeight = 320;


//02 Player Class
Player = Class.create(Sprite, {
    initialize: function() {

        //03 Bind Keys
        
        //04 Mouse Variables
    },

    onenterframe: function() {
        
        //03 Player Controls
        
        //04 Mouse Update
    }
});

//05 Gem Class
Gem = Class.create(Sprite, {
    initialize: function() {
        Sprite.call(this, 16, 16);
        this.image = game.assets['diamond-sheet.png'];
    },

    onenterframe: function() {

        //Rotating using scaleX
        
        //07 Collision Check
    }
});

//08 Bomb Class
Bomb = Class.create(Sprite, {
    initialize: function() {
        Sprite.call(this, 16, 16);
        this.image = game.assets['icon0.png'];
        this.x = Math.random() * (stgWidth - 16);
        this.y = Math.random() * (stgHeight - 16); //Account for the bottom part
        if (this.y < 50) {
            this.y = 50;
        }

        this.frame = 24;
    },

    onenterframe: function() {
        if (this.age === 60) {
            game.rootScene.removeChild(this);
        }

        if (this.intersect(player)) {
            player.health--;
            game.rootScene.removeChild(this);
            console.log("ouch!");
        }

        if (this.age % 10 === 0) {
            if (this.frame === 25) {
                this.frame = 24;
            } else {
                this.frame++;
            }
        }
    }

});


//Begin game code
window.onload = function() {
    game = new Game(stgWidth, stgHeight);
    //Preload images
    //Any resources not preloaded will not appear
    game.preload('icon0.png', 'diamond-sheet.png');

    game.onload = function() { //Prepares the game
        //01 Add Background
        
        //02 Add Player
        
        //05 Add Gem
        
        //06 Create Label
        
        //08 Health Label
        
        //04 Touch Listener
        
        //Game Condition Check
        game.rootScene.addEventListener('enterframe', function() {
            //08 Game Over
            
            //08 Make Bomb Generator
        });

    }
    game.start(); //Begin the game
}