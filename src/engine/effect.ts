/*
An effect is any entity that isn't a Unit. For instance, Veigar E would be
an effect, Lux ult would be an effect, Ezreal ult would be an effect.

Not to be confused with Status Effects
*/

import Board from "./board";
import BoardPosition from "./board_position";
import { TeamColor } from "./team";
import Unit from "./unit/unit";

export enum EffectId {
    EkkoShadow,
    EkkoTimewinder,
}

export abstract class EffectHitbox {
    abstract _checkCollision(effectPos: BoardPosition, withUnit: Unit): boolean;
    static none() {
        return new EffectNoHitbox();
    }
}

class EffectNoHitbox extends EffectHitbox {
    _checkCollision() {
        return false;
    }
}

export class EffectRectangularHitbox extends EffectHitbox {
    width: number;
    height: number;

    constructor(width: number, height: number) {
        super();
        this.width = width;
        this.height = height;

        if (width % 2 !== 1) throw new Error("Width must be an odd number");
        if (height % 2 !== 1) throw new Error("Height must be an odd number");
    }

    get _radiusX() {
        return Math.floor(this.width / 2);
    }

    get _radiusY() {
        return Math.floor(this.height / 2);
    }

    _checkCollision(center: BoardPosition, withUnit: Unit) {
        let xCheck = Math.abs(center.x - withUnit.pos.x) < this._radiusX;
        let yCheck = Math.abs(center.y - withUnit.pos.y) < this._radiusY;

        return xCheck && yCheck;
    }

    static square(size: number) {
        return new EffectRectangularHitbox(size, size);
    }
}

export abstract class Effect {
    pos: BoardPosition;
    teamColor: TeamColor;
    private _board?: Board;
    abstract id: EffectId;
    effect: EffectHitbox = EffectHitbox.none();

    constructor() {
        this.pos = new BoardPosition(0, 0);
        this.teamColor = TeamColor.Neutral;
    }

    get board() {
        if (!this._board) {
            throw new Error("This effect has not been assigned a board yet");
        }
        return this._board;
    }

    remove() {
        this.board.removeEffect(this);
    }

    _onTurnEnd(activeTurn: boolean) {
        if (activeTurn) {
            this.onActiveTurnEnd();
        } else {
            this.onInactiveTurnEnd();
        }
    }

    onActiveTurnEnd() {}

    onInactiveTurnEnd() {}

    onRemove() {}

    onPlace() {}
}
