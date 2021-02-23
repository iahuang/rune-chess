import Champion from "./unit/champion/champion";

export enum TeamColor {
    Neutral,
    Red,
    Blue
}

export class Team {
    champions: Champion[];
    color: TeamColor;

    constructor(color: TeamColor) {
        this.champions = [];
        this.color = color;
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
}