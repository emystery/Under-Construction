const pool      = require("../config/database");
const Settings  = require("./gameSettings");

function fromDBCardToCard(dbCard) {
    return new Card(
        dbCard.crd_id,
        dbCard.ugc_id,
        dbCard.crd_cost,
        dbCard.crd_name,
        dbCard.crd_effect,
        new CardType(dbCard.ct_id, dbCard.ct_name),
        dbCard.ugc_active);
}

class CardType {
    constructor(id, name) {
        this.id     = id;
        this.name   = name;
    }
}

class Card {
    constructor(cardId, deckId, cost, name, effect, type, active) {
        this.cardId = cardId;
        this.deckId = deckId;
        this.cost   = cost;
        this.name   = name;
        this.effect = effect;
        this.type   = type;
        this.active = active;
    }

    static async genCard(playerId) {
        try {
            let [cards]     = await pool.query(
                            `select * from card inner join card_type on crd_type_id = ct_id join user_game on ug_tool_level >= card.crd_cost where ug_id = ?`, [playerId]);
            
            //select * from card inner join card_type on crd_type_id = ct_id

            let rndCard     = fromDBCardToCard(cards[Math.floor(Math.random() * cards.length)]);
            // insert the card
            let [result]    = await pool.query(`Insert into user_game_card (ugc_user_game_id, ugc_card_id ,ugc_active)
                                                values (?, ?, ?)`, [playerId, rndCard.cardId, true]);
            return {status:200, result: rndCard};
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
}

class MatchDecks {
    constructor(mycards, oppcards) {
        this.mycards    = mycards;
        this.oppcards   = oppcards;
    }

    static async genPlayerDeck(playerId) {
        try {
            let cards   =[];
            for (let i = 0; i < Settings.nCards; i++) {
                let result = await Card.genCard(playerId);
                cards.push(result.result);
            }
            return {status:200, result: cards};
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async resetPlayerDeck(playerId) {
        try {
            let [result]    = await pool.query(`delete from user_game_card where ugc_user_game_id = ?`, [playerId]);
            return {status:200, result: {msg:"All cards removed"}};
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async getMatchDeck(game) {
        try {
            let [dbcards]   = await pool.query(
                                               `Select * from card
                                               inner join card_type on crd_type_id = ct_id 
                                               inner join user_game_card on ugc_card_id = crd_id
                                               where ugc_user_game_id = ? or ugc_user_game_id = ?`, 
                                               [game.player.id, game.opponents[0].id]);
            let playerCards = [];
            let oppCards    = [];
            for(let dbcard of dbcards) {
                let card    = fromDBCardToCard(dbcard);
                if (dbcard.ugc_user_game_id == game.player.id) {
                    playerCards.push(card);
                } else {
                    oppCards.push(card);
                }
            }
            return {status:200, result: new MatchDecks(playerCards,oppCards)};
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async playDeckCard(game, deckId) {
        try {
            // get the card and check if the card is from the player and it is active
            let [dbDeckCards]   = await pool.query(
                                                   `Select * from card 
                                                    inner join card_type on crd_type_id = ct_id
                                                    inner join user_game_card on ugc_card_id = crd_id
                                                    where ugc_user_game_id = ? and ugc_id = ? and ugc_active=1`, 
                                                    [game.player.id, deckId]);
            if (dbDeckCards.length == 0) {
                return {status:404, result:{msg:"Card not found for this player or not active"}};
            }   

            let card        = fromDBCardToCard(dbDeckCards[0]);
            let playerTower = game.player.tower;
            let oppTower    = game.opponents[0].tower; 
            let player      = game.player;
            let opponent    = game.opponents[0];
            
            // verifications
            // Check if we have enough money
            if (game.player.money < card.cost) {
                return {status:400, result:{msg:"Not enough money"}};
            }

            // verifications done, set card to inactive
            await pool.query("update user_game_card set ugc_active = 0 where ugc_id = ?", [deckId]);

            game.player.money -= card.cost;

            // Set player state to Acted (since we already made all the state checks)
            playerTower.state.id = 2;
            // This line should not be necessary since we only use the id to update the DB
            playerTower.state.name = "Acted";

            switch (card.cardId) {
                case 1: wreckIt(oppTower);              break;
                case 2: boom(oppTower);                 break;
                case 3: adieu(oppTower);                break;
                case 4: bobBuilder(playerTower);        break;
                case 5: planning(playerTower);          break;
                case 6: crane(playerTower);             break;
                case 7: protection(playerTower);        break;
                case 8: yoink(opponent);                break;
                case 9: noink(player);                  break;
            }

            let towerSql = `update tower set twr_tower_state_id = ?, twr_height = ? where twr_id = ?`;

            // Updating player tower and opponent tower (same query, different values)
            await pool.query(towerSql,[playerTower.state.id,    playerTower.height,     playerTower.id]);
            await pool.query(towerSql,[oppTower.state.id,       oppTower.height,        oppTower.id]);


            let playerSql = `update user_game set ug_money = ?, ug_tool_level = ? where ug_id = ?`;
            await pool.query(playerSql,[game.player.money, game.player.tools, game.player.id]);
            let oppSql = `update user_game set ug_tool_level = ? where ug_id = ?`;
            await pool.query(oppSql,[game.opponents[0].tools, game.opponents[0].id]);


            return {status:200, result: {msg: "Card played!"}};
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
}

// Auxiliary functions to calculate card actions

function wreckIt(oppTower) {
    if (oppTower.state.name != "Protected") {
        oppTower.height -= 1;
        if (oppTower.height <= 0) oppTower.height = 0;
    }
}

function boom(oppTower) {
    if (oppTower.state.name != "Protected") {
        oppTower.height -= 2;
        if (oppTower.height <= 0) oppTower.height = 0;
    }
}

function adieu(oppTower) {
    if (oppTower.state.name != "Protected") {
        oppTower.height = oppTower.height - Math.round(oppTower.height/2);
        if (oppTower.height <= 0) oppTower.height = 0;
    }
}

function bobBuilder(playerTower) {
    playerTower.height += 1;
    if (playerTower.height > Settings.maxHeight) playerTower.height = Settings.maxHeight;
}

function planning(playerTower) {
    playerTower.height += 2;
    if (playerTower.height > Settings.maxHeight) playerTower.height = Settings.maxHeight;
}

function crane(playerTower) {
    playerTower.height = playerTower.height + Math.round(playerTower.height/2);
    if (playerTower.height > Settings.maxHeight) playerTower.height = Settings.maxHeight;
    else if (playerTower.height == 0) playerTower.height = Settings.halfHeight;
}

function protection(playerTower) {
    playerTower.state.id = 3;
    // we will only use the id to update the DB, so this line shouldn't be needed 
    playerTower.state.name = "Protected";
}

function yoink(opponent) {
    if (opponent.tools > 1) opponent.tools --;
}

function noink(player) {
    if (player.tools < 3) player.tools ++;
}

module.exports = MatchDecks;