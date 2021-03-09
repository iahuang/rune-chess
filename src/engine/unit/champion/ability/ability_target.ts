import BoardPosition from "../../../board_position";
import Unit from "../../unit";

export default class AbilityTarget {
    _unit: Unit | null = null;
    _location: BoardPosition | null = null;

    static atUnit(unit: Unit) {
        let target = new AbilityTarget();
        target._unit = unit;
        return target;
    }

    static atLocation(pos: BoardPosition) {
        let target = new AbilityTarget();
        target._location = pos;
        return target;
    }

    static noTarget() {
        return new AbilityTarget();
    }

    get hasNoTarget() {
        return !(this._unit || this._location);
    }

    getUnit() {
        if (!this._unit) throw new Error("Cannot call getUnit on an AbilityTarget with no associated Unit");
        return this._unit;
    }

    getLocation() {
        if (!this._location) throw new Error("Cannot call getLocation on an AbilityTarget with no associated Unit");
        return this._location;
    }

    get hasUnit() {
        return this._unit !== null;
    }

    get hasLocation() {
        return this._location !== null;
    }

    // get location() {
    //     if (this.location) return this.location;
    //     if (this.unit) return this.unit.pos;
    //     return null;
    // }
}