import Discord from "discord.js";
import RuneChess from "../engine/game";

interface Params {
    playerRed: Discord.User;
    playerBlue: Discord.User;
    channel: Discord.Channel;
}

export default class Match {
    playerRed: Discord.User;
    playerBlue: Discord.User;
    channel: Discord.Channel;
    game: RuneChess;

    constructor(params: Params) {
        this.playerRed = params.playerRed;
        this.playerBlue = params.playerBlue;
        this.channel = params.channel;
        this.game = new RuneChess();
    }

    begin() {
        
    }
}