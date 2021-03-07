/*
An effect is any entity that isn't a Unit. For instance, Veigar E would be
an effect, Lux ult would be an effect, Ezreal ult would be an effect.

Not to be confused with Status Effects
*/

import Board from "./board";
import BoardPosition from "./board_position";
import { TeamColor } from "./team";

export enum EffectId {
    EkkoShadow,
    EkkoTimewinder,
}

export abstract class Effect {
    pos: BoardPosition;
    team: TeamColor;
    private _board?: Board;
    abstract id: EffectId;

    constructor() {
        this.pos = new BoardPosition(0, 0);
        this.team = TeamColor.Neutral;
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

    onRemove() {}

    onPlace() {}
}
