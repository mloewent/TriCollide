enchant(); //the magic words that start enchant.js
//Stage Variables
var moveSpeed = 4;
var health = 5;
var stgWidth = 1024;
var stgHeight = 768;
var triWidth = 100
var triHeight = 100;


//02 Triangle Class
Triangle = Class.create(Sprite, {
    initialize: function() {
         Sprite.call(this, triWidth, triHeight);
         this.image = game.assets['tri1.png'];
         this.x = stgWidth/2;
         this.y = stgHeight/2;
        //03 Bind Keys
        
        //04 Mouse Variables
    },

    onenterframe: function() {
        
        //03 Triangle Controls
        
        //04 Mouse Update
    }
});

//Begin game code
window.onload = function() {
    game = new Game(stgWidth, stgHeight);
    //Preload images
    //Any resources not preloaded will not appear
    game.preload('tri1.png', 'diamond-sheet.png', 'bg.png');

    game.onload = function() { //Prepares the game
        //01 Add Background
        bg = new Sprite(stgWidth, stgHeight);
        bg.image = game.assets['bg.png'];
        game.rootScene.addChild(bg);
        
        //02 Add Triangle
        tri = new Triangle();
        game.rootScene.addChild(tri);
        
        
        //Game Condition Check
        game.rootScene.addEventListener('enterframe', function() {
            //08 Game Over
            
        });

    }
    game.start(); //Begin the game
}
