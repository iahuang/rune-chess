import Globals from "./globals";
import Champion from "./unit/champion/champion";

export enum TeamColor {
    Neutral,
    Red,
    Blue
}

export class Team {
    champions: Champion[];
    color: TeamColor;

    actionPointsRemaining: number;

    constructor(color: TeamColor) {
        this.champions = [];
        this.color = color;
        this.actionPointsRemaining = 2;
    }

    opposingTeamColor() {
        if (this.color === TeamColor.Blue) {
            return TeamColor.Red;
        }
        if (this.color === TeamColor.Red) {
            return TeamColor.Blue;
        }
        return TeamColor.Neutral;
    }

    refreshActionPoints() {
        this.actionPointsRemaining = Globals.actionPointsPerTurn;
    }
}