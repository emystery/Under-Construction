class Card {
    static width    = (384*0.60);
    static height   = (256*0.60);

   // static width    = GameInfo.width/(384*0.70)*42;
   // static height   = GameInfo.height/(256*0.70)*42;

    constructor(card, x, y, img) {
        this.card   = card;
        this.x      = x;
        this.y      = y;
        this.img    = img;
    }

    draw() {
            if (!this.card.active) tint(250,100,100);
            else tint(255,255,255);
    
            image(this.img, this.x, this.y, Card.width, Card.height);
            
            textAlign(CENTER,CENTER);
            fill(255)
            textStyle(BOLD);
            textSize(20);
            stroke(0);
            strokeWeight(3);
            text(this.card.cost, this.x + Card.width*0.805, this.y + Card.height*0.152, Card.width/256);
            textStyle(BOLD);
            strokeWeight(1);
            noStroke();
            fill(0);
            textSize(16);
            text(this.card.name, this.x + Card.width*0.802, this.y + Card.height*0.35, Card.width/256);
            textStyle(BOLD);
            textSize(12);
            textAlign(CENTER,CENTER); 
            text(this.card.effect, this.x + Card.width*0.8, this.y + Card.height*0.68, Card.width/256);
            noTint();
       
        }
    click() {
        return mouseX > this.x && mouseX < this.x+Card.width &&
               mouseY > this.y && mouseY < this.y+Card.height;
    }
}

class Deck {
    static titleHeight  = GameInfo.height/15;
    static nCards       = 3;

    constructor(title, cardsInfo, x, y, clickAction, cardsImg, xOffset, yOffset) {
        this.title = title;
        this.x              = x;
        this.y              = y;
        this.width          = Card.width*Deck.nCards;
        this.clickAction    = clickAction;
        this.cardsImg       = cardsImg;
        this.cards          = this.createCards(cardsInfo);
        this.xOffset        = xOffset;
        this.yOffset        = yOffset;
    }
    
    createCards(cardsInfo) {
        let cards   = [];
        let x       = this.x;
        let y       = this.y + Deck.titleHeight - GameInfo.height/4.5;
        for (let cardInfo of cardsInfo) {
            if (cardsInfo == GameInfo.matchDecks.mycards) {
                cards.push(new Card(cardInfo, x, y, this.cardsImg[cardInfo.cardId]));
                y += Card.height + GameInfo.height/128;
            } else {
                cardInfo.cost   = " ";
                cardInfo.name   = " ";
                cardInfo.effect = " ";
                cards.push(new Card(cardInfo, x, y, this.cardsImg[0]));
                y += Card.height + GameInfo.height/128;
            }
        }
        return cards;
    }

    update(cardsInfo) {
        this.cards = this.createCards(cardsInfo);
    }


    draw () {
        textStyle(BOLD)
        fill(0);
        noStroke();
        textSize(28);
        textAlign(CENTER,CENTER);
        text(this.title, this.x - this.xOffset, this.y - this.yOffset, this.width, Deck.titleHeight);
        for (let card of this.cards) {
            card.draw();
        }
    }

    click() {
        if (this.clickAction) {
            for (let card of this.cards) {
                if (card.click()) {
                    this.clickAction(card.card);
                } 
            }
        }
    }
}

