import Discord from "discord.js";
import { RuneChess } from "../engine/game";
import { randomChar } from "../engine/util/rand";

interface Params {
    playerRed: Discord.GuildMember;
    playerBlue: Discord.GuildMember;
    channel: Discord.TextChannel;
}

function generateID() {
    let id = "";
    for (let i=0; i<8; i++) {
        id+=randomChar("ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")
    }
    return id;
}

export default class Match {
    playerRed: Discord.GuildMember;
    playerBlue: Discord.GuildMember;
    channel: Discord.TextChannel;
    game: RuneChess;
    id: string;

    constructor(params: Params) {
        this.playerRed = params.playerRed;
        this.playerBlue = params.playerBlue;
        this.channel = params.channel;
        this.game = new RuneChess();
        this.id = generateID();
    }

    begin() {
        this.game.begin();
    }

    hasUser(user: Discord.GuildMember) {
        return (this.playerBlue.id === user.id) || (this.playerRed.id === user.id);
    }
}