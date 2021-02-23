import ASCIIRenderer from "./ascii_render";
import Board from "./board";
import { Team, TeamColor } from "./team";

export default class RuneChess {
    board: Board;
    debugRenderer: ASCIIRenderer;

    teamRed: Team;
    teamBlue: Team;
    teamNeutral: Team;

    constructor() {
        this.board = new Board();
        this.debugRenderer = new ASCIIRenderer({cellWidth: 12, cellHeight: 6});
        
        this.teamRed = new Team(TeamColor.Red);
        this.teamBlue = new Team(TeamColor.Blue);
        this.teamNeutral = new Team(TeamColor.Neutral);
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