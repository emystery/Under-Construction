class Tower {
    static textWidth        = GameInfo.width/12;
    static textHeight       = GameInfo.height/6;
    static space            = GameInfo.width/256;

    constructor (title, tower, x, y, twrHeight, img, flipped) {
        this.title      = title;
        this.tower      = tower;
        this.x          = x;
        this.y          = y;
        this.twrHeight  = twrHeight;
        this.twrWidth   = twrHeight*4;
        this.img        = img;

        if (flipped) {
            this.textOffset = 20 + this.twrWidth + Tower.space;
            this.imgOffset  = 20;

        } else {
            this.textOffset = -20 - this.twrWidth - Tower.space - Tower.textWidth;
            this.imgOffset  = -20 - this.twrWidth;
        }

    }
    update(tower) {
        this.tower = tower;
    }
    draw() {

        fill(255);
        textAlign(CENTER, CENTER);
        textSize(18);
        textStyle(BOLD);

        text("Height: " + this.tower.height, 
             this.textOffset + this.x,
             this.y + Tower.textHeight + 495, 
             Tower.textWidth, 
             Tower.textHeight/3);
        
        for (let i = 0; i < this.tower.height; i++){
            
            if (this.tower.state != "Protected") {
                tint(255,255,255);
            } else tint(255, 255, 10);

            image(
                this.img, 
                this.x + this.imgOffset, 
                this.y + GameInfo.height - GameInfo.height/8 - i*this.twrHeight, 
                this.twrWidth, 
                this.twrHeight);
            }

    }
}