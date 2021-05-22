import Discord from "discord.js";
import { RuneChess } from "../engine/game";
import { TeamColor } from "../engine/team";
import { randomChar, randomItem } from "../util/rand";

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

export class DraftState {
    picking = randomItem([TeamColor.Red, TeamColor.Blue]);
    pickStage = 0;

    numChampionsPicking() {
        /*
            The champion select stage:
            
            (given that Team A picks first)

            - Team A picks 1 (1/5) <- pickStage=0
            - Team B picks 2 (2/5)
            - Team A picks 2 (3/5)
            - Team B picks 2 (4/5)
            - Team A picks 2 (5/5)
            - Team B picks 1 (5/5) <- pickStage=5

            This function returns how many champions
            should be picked during the given pick stage
        */

        return this.pickStage === 0 || this.pickStage === 5 ? 1 : 2;
    }

    // Arrays that represent the current champions that
    // each team has picked (by champion internal name)
    redTeamDraft: string[] = [];
    blueTeamDraft: string[] = [];

    // similar
    bans: string[] = [];
}

/*
    Describes where the match currently is at, in terms
    of stage of the game
*/
export enum MatchStage {

}

export class Match {
    playerRed: Discord.GuildMember;
    playerBlue: Discord.GuildMember;

    pRedState: PlayerState;
    pBlueState: PlayerState;

    channel: Discord.TextChannel;
    game: RuneChess;
    id: string;

    draftState: DraftState;

    constructor(params: Params) {
        this.playerRed = params.playerRed;
        this.playerBlue = params.playerBlue;
        this.pRedState = new PlayerState();
        this.pBlueState = new PlayerState();
        this.channel = params.channel;
        this.game = new RuneChess();
        this.id = generateID();

        this.draftState = new DraftState();
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
