import ASCIIRenderer from "./debug/ascii_render";
import Board from "./board";
import { Team, TeamColor } from "./team";
import Unit from "./unit/champion/champion";
import { ChampionRegistry } from "./unit/champion/champion_registry";
import { randomItem } from "./util/rand";
import {createMinion, Minion} from "./unit/minion";
import BoardPosition from "./board_position";
import Champion from "./unit/champion/champion";

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

    assignTeam(unit: Unit, teamColor: TeamColor) {
        unit.teamColor = teamColor;
    }

    placeUnit(unit: Unit, pos: BoardPosition, teamColor: TeamColor) {
        this.board.placeUnit(unit, pos);
        this.assignTeam(unit, teamColor);
    }

    setDebugLayout() {
        for (let i=0; i<8; i++) {
            this.placeUnit(createMinion() as Unit, new BoardPosition(i, 0), TeamColor.Red);
            this.placeUnit(createMinion() as Unit, new BoardPosition(i, 7), TeamColor.Blue);
        }
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