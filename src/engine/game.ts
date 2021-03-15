import ASCIIRenderer from "./debug/ascii_render";
import Board from "./board";
import { Team, TeamColor } from "./team";
import Unit from "./unit/champion/champion";
import { ChampionRegistry } from "./unit/champion/champion_registry";
import { randomItem } from "../util/rand";
import { createMinion, Minion } from "./unit/minion";
import BoardPosition from "./board_position";
import Champion from "./unit/champion/champion";
import { ChampionDiana } from "./unit/champion/champions/diana";
import { ChampionSenna } from "./unit/champion/champions/senna";
import { DamageType } from "./damage";
import { ChampionYone } from "./unit/champion/champions/yone";
import { ChampionEkko } from "./unit/champion/champions/ekko";

interface GEHandler<T> {
    function: GameEventCallback<T>;
    id: number;
}

type GameEventCallback<T> = (event: T) => void;

export class GameEventHandler<T> {
    handlers: GEHandler<T>[];
    _nextId = 0;
    constructor() {
        this.handlers = [];
    }
    broadcast(msg: T) {
        for (let c of this.handlers) {
            c.function(msg);
        }
    }
    addEventListener(callback: GameEventCallback<T>) {
        this.handlers.push({
            function: callback,
            id: this._nextId,
        });
        this._nextId++;
        return this._nextId - 1;
    }
    removeEventListener(id: number) {
        let lengthBefore = this.handlers.length;
        this.handlers = this.handlers.filter((c) => c.id !== id);
        if (lengthBefore === this.handlers.length) throw new Error(`Could not find event listener with id ${id}`);
    }
}

export interface DamageTakenEvent {
    from: Unit;
    to: Unit;
    preMitigationDamage: number;
    postMitigationDamage: number;
    type: DamageType;
}

export class RuneChess {
    board: Board;
    debugRenderer: ASCIIRenderer;

    teamRed: Team;
    teamBlue: Team;
    teamNeutral: Team;

    turn: TeamColor;

    events = {
        damageTaken: new GameEventHandler<DamageTakenEvent>(),
    };

    constructor() {
        this.board = new Board();
        this.debugRenderer = new ASCIIRenderer({ cellWidth: 12, cellHeight: 6 });

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
        this.placeUnit(new ChampionEkko(), new BoardPosition(0, 0), TeamColor.Red);
        this.placeUnit(new ChampionDiana(), new BoardPosition(0, 7), TeamColor.Blue);
        for (let i = 0; i < 8; i++) {
            this.placeUnit(createMinion() as Unit, new BoardPosition(i, 1), TeamColor.Red);
            this.placeUnit(createMinion() as Unit, new BoardPosition(i, 6), TeamColor.Blue);
        }
    }

    begin() {
        this.board.setGameInstance(this);
        this.turn = randomItem([TeamColor.Red, TeamColor.Blue]);
    }

    getTeamWithColor(color: TeamColor) {
        return {
            [TeamColor.Red]: this.teamRed,
            [TeamColor.Blue]: this.teamBlue,
            [TeamColor.Neutral]: this.teamNeutral,
        }[color];
    }

    getOpposingTeam(to: Team) {
        return this.getTeamWithColor(to.opposingTeamColor());
    }

    getActiveTeam() {
        return this.getTeamWithColor(this.turn);
    }

    endTurn() {
        for (let unit of this.board.allUnits()) {
            unit._onTurnEnd(unit.teamColor === this.turn);
        }

        for (let effect of this.board.effects) {
            effect._onTurnEnd(effect.teamColor === this.turn);
        }

        this.turn = this.getActiveTeam().opposingTeamColor();
    }
}
