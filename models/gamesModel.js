const pool  = require("../config/database");
const State = require("./statesModel");

class Tower {
    constructor(id, height, state) {
        this.id         = id;
        this.height     = height;
        this.state      = state;
    }
    export() {
        let tower       = new Tower();
        tower.height    = this.height;
        tower.state     = this.state.export();
        return tower;
    }
}

// For now it is only an auxiliary class to hold data in here 
// so no need to create a model file for it
class Player {
    constructor(id, name, state, order, tower, money, tools) {
        this.id     = id;        
        this.name   = name;
        this.state  = state;
        this.order  = order;
        this.tower  = tower;
        this.money  = money;
        this.tools  = tools;
    }
    export() {
        let player      = new Player();
        player.name     = this.name;
        player.state    = this.state.export();
        player.order    = this.order;
        player.tower    = this.tower.export();
        player.money    = this.money;
        player.tools    = this.tools;
        return player;
    }
}


class Game {
    constructor(id,turn,state,player,opponents) {
        this.id         = id;
        this.turn       = turn;
        this.state      = state;
        this.player     = player;
        this.opponents  = opponents || [];
    }
    export() {
        let game        = new Game();
        game.id         = this.id;
        game.turn       = this.turn;
        game.state      = this.state.export();
        if (this.player)
            game.player = this.player.export();
        game.opponents  = this.opponents.map(o => o.export());
        return game;
    }    

    // No verifications, we assume they were already made
    // This is mostly an auxiliary method
    static async fillPlayersOfGame(userId,game) {
        try {
            let [dbPlayers] = await pool.query(
            `Select * from user 
            inner join user_game on ug_user_id = usr_id
            inner join user_game_state on ugst_id = ug_state_id
            left join tower on twr_user_game_id = ug_id
            left join tower_state on twr_tower_state_id = tst_id
            where ug_game_id=?`, [game.id]);
            for (let dbPlayer of dbPlayers) {
            let player  = new Player
                                (dbPlayer.ug_id,
                                dbPlayer.usr_name,
                                new State(dbPlayer.ugst_id,dbPlayer.ugst_state),
                                dbPlayer.ug_order,
                                new Tower(dbPlayer.twr_id, dbPlayer.twr_height,
                                new State(dbPlayer.tst_id, dbPlayer.tst_name)),
                                dbPlayer.ug_money,
                                dbPlayer.ug_tool_level);
                if (dbPlayer.usr_id == userId) game.player = player;
                else game.opponents.push(player);
            }
            return {status:200, result: game};
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
    
    static async getGamesWaitingForPlayers(userId) {
        try {
            let [dbGames] =
                await pool.query(
                    `Select * from game 
                    inner join game_state on gm_state_id = gst_id
                    where gst_state = 'Waiting'`);
            let games = [];
            for (let dbGame of dbGames) {
                let game = new Game(dbGame.gm_id,dbGame.gm_turn,new State(dbGame.gst_id,dbGame.gst_state));
                let result = await this.fillPlayersOfGame(userId,game);
                if (result.status != 200) {
                    return result;
                }
                game = result.result;
                games.push(game);
            }
            return { status: 200, result: games} ;
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }    

    static async getPlayerActiveGame(id) {
        try {
            let [dbGames] =
                await pool.query(
                    `Select * from game 
                    inner join user_game on gm_id = ug_game_id 
                    inner join user_game_state on ug_state_id = ugst_id
                    inner join game_state on gm_state_id = gst_id
                    where ug_user_id=? and (gst_state IN ('Waiting','Started') 
                    or (gst_state = 'Finished' and ugst_state = 'Score')) `, [id]);
            if (dbGames.length==0)
                return {status:200, result:false};
            let dbGame = dbGames[0];
            let game = new Game(dbGame.gm_id,dbGame.gm_turn,new State(dbGame.gst_id,dbGame.gst_state));
            let result = await this.fillPlayersOfGame(id,game);
            if (result.status != 200) {
                return result;
            }
            game = result.result;
        return { status: 200, result: game} ;
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    // A game is always created with one user
    // No verifications. We assume the following were already made (because of authentication):
    //  - Id exists and user exists
    //  - User does not have an active game
    static async create(userId) {
        try {
            // create the game
            let [result] = await pool.query(`Insert into game (gm_state_id) values (?)`, [1]);
            let gameId = result.insertId;
            // add the user to the game
            await pool.query(`Insert into user_game (ug_user_id, ug_game_id, ug_state_id, ug_money, ug_tool_level) values (?, ?, ?, ?, ?)`,
                 [userId, gameId, 1, 0, 1]);
            return {status:200, result: {msg: "You created a new game."}};
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    // No verification needed since we considered that it was already made 
    // This should have a verification from every player
    // - If only one player it would cancel
    // - Else, each player would only change his state to cancel
    // - When the last player run the cancel the game would cancel
    // (no need to be this complex since we will only use this to invalidate games)
    // Cancelled games are not scored
    static async cancel(gameId) {
        try {
            await pool.query(`Update game set gm_state_id=? where gm_id = ?`,
                    [4,gameId]);
            return {status:200, result: {msg: "Game canceled."}};
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    // ---- These methods assume a two players game (we need it at this point) --------      

    // We consider the following verifications were already made (because of authentication):
    //  - Id exists and user exists
    //  - User does not have an active game
    // We still need to check if the game exist and if it is waiting for players
    static async join(userId, gameId) {
        try {
            let [dbGames] = await pool.query(`Select * from game where gm_id=?`, [gameId]);
            if (dbGames.length==0)
                return {status:404, result:{msg:"Game not found"}};
            let dbGame = dbGames[0];
            if (dbGame.gm_state_id != 1) 
                return {status:400, result:{msg:"Game not waiting for other players"}};
            
            // Randomly determine who starts    
            let myTurn = (Math.random() < 0.5);

            // We join the game but the game still has not started, that will be done outside
            let [result] = await pool.query(`Insert into user_game (ug_user_id, ug_game_id, ug_state_id, ug_money, ug_tool_level) values (?, ?, ?, ?, ?)`,
                        [userId, gameId, 1, 0, 1]);
         
            return {status:200, result: {msg: "You joined the game."}};
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
}

module.exports = Game;