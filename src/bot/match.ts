import Discord from "discord.js";
import { RuneChess } from "../engine/game";
import { TeamColor } from "../engine/team";
import { randomChar } from "../util/rand";

interface Params {
    playerRed: Discord.GuildMember;
    playerBlue: Discord.GuildMember;
    channel: Discord.TextChannel;
}

function generateID() {
    let id = "";
    for (let i = 0; i < 8; i++) {
        id += randomChar("ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890");
    }
    return id;
}

export class PlayerState {
    hasGottenEarlyTurnEndWarning = false;
}

export class Match {
    playerRed: Discord.GuildMember;
    playerBlue: Discord.GuildMember;

    pRedState: PlayerState;
    pBlueState: PlayerState;

    channel: Discord.TextChannel;
    game: RuneChess;
    id: string;

    constructor(params: Params) {
        this.playerRed = params.playerRed;
        this.playerBlue = params.playerBlue;
        this.pRedState = new PlayerState();
        this.pBlueState = new PlayerState();
        this.channel = params.channel;
        this.game = new RuneChess();
        this.id = generateID();
    }

    begin() {
        this.game.begin();
    }

    hasUser(user: Discord.GuildMember) {
        return this.playerBlue.id === user.id || this.playerRed.id === user.id;
    }

    getPlayerWithColor(color: TeamColor) {
        if (color === TeamColor.Red) {
            return this.playerRed;
        }
        if (color === TeamColor.Blue) {
            return this.playerBlue;
        }

        throw new Error(`No player exists with team color "${TeamColor[color]}"`);
    }

    getPlayerStateWithColor(color: TeamColor) {
        if (color === TeamColor.Red) {
            return this.pRedState;
        }
        if (color === TeamColor.Blue) {
            return this.pBlueState;
        }

        throw new Error(`No player exists with team color "${TeamColor[color]}"`);
    }
}
