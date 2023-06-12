class ScoreBoard {
    static width = GameInfo.width/3.5;
    static height = GameInfo.height/7;
    
    static widthMoney = GameInfo.width/32;
    static heightMoney = GameInfo.height/1.6;

    static x = GameInfo.width/2 - this.width/2;
    static y = GameInfo.height/70;
    
    static xMoney   = GameInfo.width/32 - this.widthMoney/2;
    //static yMoney   = GameInfo.height/7;
    static yMoney   = 224 + GameInfo.height/15 - GameInfo.height/4.5;

    constructor(game) {
        this.game = game;
    }

    draw() {
        fill(240,240,255);
        stroke(0,0,0);
        rect (ScoreBoard.x, ScoreBoard.y, ScoreBoard.width, ScoreBoard.height, 5, 5, 5, 5);

        fill (100,255,255);
        rect (ScoreBoard.xMoney, ScoreBoard.yMoney, ScoreBoard.widthMoney, ScoreBoard.heightMoney);
        fill (255,255,100)

        if(this.game.player.money <= 40){
            rect (ScoreBoard.xMoney, ScoreBoard.yMoney, ScoreBoard.widthMoney, this.game.player.money*12);
        }else {
            rect (ScoreBoard.xMoney, ScoreBoard.yMoney, ScoreBoard.widthMoney, ScoreBoard.heightMoney);
        }

        fill (0,0,0);
        textAlign(CENTER,CENTER);
        textStyle(NORMAL);
        text ("Y O U R       M O N E Y __ " + "  " + this.game.player.money + "$", ScoreBoard.xMoney + ScoreBoard.widthMoney/4, ScoreBoard.yMoney, ScoreBoard.widthMoney/2, ScoreBoard.heightMoney);

        
        image(
            GameInfo.images.tools[this.game.player.tools], 
            GameInfo.width/16, 
            GameInfo.height*0.82,//*256*0.6, 
            128*0.8, 
            128*0.8);
        
        fill(255);
        textAlign(CENTER,CENTER);
        textSize(20);
        textStyle(BOLD);
        text("Tool level: " + this.game.player.tools, GameInfo.width/16 + GameInfo.width/10, GameInfo.height*0.82 + 64);

        fill(0,0,0);
        textAlign(LEFT,CENTER);
        textSize(16);
        textStyle(NORMAL);
        text("Turn: "       + this.game.turn,               ScoreBoard.x + 10,    ScoreBoard.y + ScoreBoard.height/4,)

        text("Player: "     + this.game.player.name,       ScoreBoard.x + 10,    ScoreBoard.y + 2*ScoreBoard.height/4);

        text("Opponent: "   + this.game.opponents[0].name,  ScoreBoard.x + 10,    ScoreBoard.y + 3*ScoreBoard.height/4);

        text(this.game.player.state,         ScoreBoard.x + GameInfo.width/2 - ScoreBoard.width - 10, ScoreBoard.y + 2*ScoreBoard.height/4,ScoreBoard.width);

        text(this.game.opponents[0].state,   ScoreBoard.x + GameInfo.width/2 - ScoreBoard.width - 10, ScoreBoard.y + 3*ScoreBoard.height/4,ScoreBoard.width);
        
        if (this.game.state == "Finished"){ 
            fill(200,0,0);
            textSize(24);
            textStyle(BOLD);
            textAlign(CENTER,CENTER);
            text("GAMEOVER",    ScoreBoard.x + 200, ScoreBoard.y - 5 + ScoreBoard.height/4)    
        }
    }

    update(game) {
        this.game = game;
    }
}