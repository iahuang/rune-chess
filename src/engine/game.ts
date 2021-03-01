import ASCIIRenderer from "./debug/ascii_render";
import Board from "./board";
import { Team, TeamColor } from "./team";
import Champion from "./unit/champion/champion";
import { ChampionRegistry } from "./unit/champion/champion_registry";
import { randomItem } from "./util/rand";

export default class RuneChess {
    board: Board;
    debugRenderer: ASCIIRenderer;

    teamRed: Team;
    teamBlue: Team;
    teamNeutral: Team;

    turn: TeamColor;

    constructor() {
        this.board = new Board();
        this.debugRenderer = new ASCIIRenderer({cellWidth: 12, cellHeight: 6});
        
        this.teamRed = new Team(TeamColor.Red);
        this.teamBlue = new Team(TeamColor.Blue);
        this.teamNeutral = new Team(TeamColor.Neutral);

        this.turn = TeamColor.Neutral;
    }

    assignTeam(champion: Champion, teamColor: TeamColor) {
        champion.teamColor = teamColor;
    }

    begin() {
        this.turn = randomItem([TeamColor.Red, TeamColor.Blue]);
    }

    getTeamWithColor(color: TeamColor) {
        return {
            [TeamColor.Red]: this.teamRed,
            [TeamColor.Blue]: this.teamBlue,
            [TeamColor.Neutral]: this.teamNeutral
        }[color];
    }

    getOpposingTeam(to: Team) {
        return this.getTeamWithColor(to.opposingTeamColor());
    }
}