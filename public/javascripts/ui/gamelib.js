async function refresh() {
    if (GameInfo.game.player.state == "Waiting") { 
        // Every time we are waiting
        await getGameInfo();
        await getDecksInfo();
        await getTowersInfo();        
        if (GameInfo.game.player.state != "Waiting") {
            // The moment we pass from waiting to play
            GameInfo.prepareUI();
        }
    } 
    // Nothing to do when we are playing since we control all that happens 
    // so no update is needed from the server
}

function preload() {
    GameInfo.images.cards       = [];

    GameInfo.images.cards[0]    = loadImage('/assets/card.png');

    GameInfo.images.cards[1]    = loadImage('/assets/demo_ball.png');
    GameInfo.images.cards[2]    = loadImage('/assets/demo_tnt.png');
    GameInfo.images.cards[3]    = loadImage('/assets/demo_nuke.png');

    GameInfo.images.cards[4]    = loadImage('/assets/con_bob.png');
    GameInfo.images.cards[5]    = loadImage('/assets/con_plan.png');
    GameInfo.images.cards[6]    = loadImage('/assets/con_crane.png');
    GameInfo.images.cards[7]    = loadImage('/assets/util_protect.png');

    GameInfo.images.cards[8]    = loadImage('/assets/util_tooldown.png');
    GameInfo.images.cards[9]    = loadImage('/assets/util_toolup.png');


    GameInfo.images.tools       = [];

    GameInfo.images.tools[1]    = loadImage('/assets/tool_1.png');
    GameInfo.images.tools[2]    = loadImage('/assets/tool_2.png');
    GameInfo.images.tools[3]    = loadImage('/assets/tool_3.png');


    GameInfo.images.backGround  = loadImage('/assets/background.png');
    GameInfo.images.tower       = loadImage('/assets/segment.png');

    GameInfo.images.home        = loadImage('/assets/home.png');

    GameInfo.audio.demo         = new Audio('/assets/audio/Explosion.mp3');
    GameInfo.audio.con          = new Audio('/assets/audio/Jump.mp3');
    GameInfo.audio.util         = new Audio('/assets/audio/Powerup.mp3');
}

async function setup() {
    let canvas = createCanvas(GameInfo.width, GameInfo.height);
    canvas.parent('game');
    // preload  images
    
    await  getGameInfo();
    setInterval(refresh,1000);

    //buttons (create a separated function if they are many)
    GameInfo.endturnButton = createButton('End Turn');
    GameInfo.endturnButton.parent('game');
    GameInfo.endturnButton.position(GameInfo.width-150,GameInfo.height-50);
    GameInfo.endturnButton.mousePressed(endturnAction);
    GameInfo.endturnButton.addClass('game')

    await getDecksInfo();
    await getTowersInfo();

    GameInfo.prepareUI();
    
    GameInfo.loading = false;
}

function draw() {
    background(GameInfo.images.backGround);
    if (GameInfo.loading) {
        textAlign(CENTER, CENTER);
        textSize(40);
        fill('black');
        text('Loading...', GameInfo.width/2, GameInfo.height/2);
    } else if (GameInfo.game.state == "Finished" && GameInfo.scoreWindow) {
        GameInfo.scoreWindow.draw();
    } else  {
        GameInfo.playerTower.draw();
        GameInfo.oppTower.draw();
        GameInfo.scoreBoard.draw();
        GameInfo.playerDeck.draw();
        GameInfo.oppDeck.draw();
    }
}

async function mouseClicked() {
    if (GameInfo.playerDeck) {
        GameInfo.playerDeck.click()
    }
}