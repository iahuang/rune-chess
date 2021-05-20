import BoardPosition from "./board_position";
import Globals from "./globals";
import { Effect } from "./effect";
import { RuneChess } from "./game";
import { TeamColor } from "./team";
import Unit from "./unit/unit";

export default class Board {
    private _units: (Unit | null)[]; // flattened 2d array, row-first
    private _game?: RuneChess;
    effects: Effect[];

    constructor() {
        this._units = [];
        this.effects = [];

        // initialize board
        for (let i = 0; i < Globals.boardSize * Globals.boardSize; i++) {
            this._units.push(null);
        }
    }

    get gameInstance() {
        if (!this._game) {
            throw new Error("Board has not been initialized into a game instance");
        }

        return this._game;
    }

    setGameInstance(game: RuneChess) {
        this._game = game;
    }

    private _boardDataIndex(pos: BoardPosition) {
        return pos.y * Globals.boardSize + pos.x;
    }

    placeUnit(unit: Unit, pos: BoardPosition) {
        if (unit.isLinkedToBoard()) throw new Error("This unit has already been placed!");
        unit.linkBoard(this);
        unit.pos = pos.copy();
        if (this.getUnitAt(pos)) {
            throw new Error("There is already a piece here");
        }
        this._units[this._boardDataIndex(pos)] = unit;
        unit._onPlace();
    }

    popUnit(pos: BoardPosition) {
        /* "pop" a unit at a position off the board and returns it. retains the 
            reference to this board.
        */

        if (!this.getUnitAt(pos)) {
            throw new Error("There is no unit here");
        }

        let unit = this.getUnitAt(pos);
        this._units[this._boardDataIndex(pos)] = null;
        return unit;
    }

    moveUnit(unit: Unit, to: BoardPosition) {
        // ensure this unit is linked to this board
        if (unit.board !== this) {
            throw new Error("Cannot move a unit not linked to this board");
        }

        // local variable "unit" maintains a reference to the underlying Unit instance;
        // should not be garbage collected.
        this._units[this._boardDataIndex(unit.pos)] = null;
        this._units[this._boardDataIndex(to)] = unit;
        unit.pos = to.copy();
    }

    getUnitAt(pos: BoardPosition) {
        if (!pos.inBounds) return null;
        return this._units[this._boardDataIndex(pos)];
    }

    hasUnitAt(pos: BoardPosition) {
        return this.getUnitAt(pos) !== null;
    }

    allUnits() {
        return this._units.filter((u) => u !== null) as Unit[];
    }

    createEffect<T extends Effect>(E: new () => T, at: BoardPosition, team = TeamColor.Neutral) {
        let effect = new E();
        effect.pos = at.copy();
        effect.teamColor = team;

        this.effects.push(effect);

        effect.onPlace();
        this._runEffectCollisions(effect);
        return effect;
    }

    removeEffect(effect: Effect) {
        effect.onRemove();
        this.effects = this.effects.filter((e) => e !== effect);
    }

    displace(unit: Unit) {
        // first try to move unit one square towards its starting side
        let dy = unit.teamColor === TeamColor.Red ? -1 : 1;
        let behind = unit.pos.offsetBy(0, dy);
        if (behind.inBounds && this.getUnitAt(behind) === null) {
            this.moveUnit(unit, behind);
            return;
        }
        // if that doesn't work, find the closest empty position
        let allPositions = [];
        for (let x = 0; x < Globals.boardSize; x++) {
            for (let y = 0; y < Globals.boardSize; y++) {
                allPositions.push(new BoardPosition(x, y));
            }
        }
        // filter board positions to just empty squares
        allPositions = allPositions.filter((p) => unit.board.getUnitAt(p) === null);
        // sort by closest position to the start
        allPositions.sort((a, b)=>{
            let distA = BoardPosition.manhattanDistance(a, unit.pos);
            let distB = BoardPosition.manhattanDistance(b, unit.pos);
            return distA - distB;
        });
        // move there
        let closest = allPositions[0];
        if (!closest) throw new Error("Cannot displace unit; no available empty squares");
        unit.moveTo(closest);

    }

    _runEffectCollisions(effect: Effect) {
        let hitbox = effect.hitbox;

        for (let unit of this.allUnits()) {
            if (hitbox._checkCollision(effect.pos, unit)) {
                effect.onCollision(unit);
            }
        }
    }

    _moveEffect(effect: Effect, to: BoardPosition) {
        effect.pos = to.copy();
        this._runEffectCollisions(effect);
    }
}
