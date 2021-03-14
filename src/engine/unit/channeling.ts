import Unit from "./unit";

export class UnitChannel {
    private _unit: Unit | null = null;
    channelDuration: number = 0;
    timeRemaining: number = 0;
    _setParentUnit(unit: Unit) {
        this._unit = unit;
    }
    setDuration(duration: number) {
        this.channelDuration = duration;
        this.timeRemaining = duration;
    }
    get unit() {
        let u = this._unit;
        if (!u) throw new Error("This Channel object is not associated with a Unit!");
        return u;
    }
    onBegin() {
        // called when the unit begins channeling
    }
    onInterrupt() {
        // called if the unit interrupts channeling early
    }
    onComplete() {
        // called if the unit successfully finishes the channel
    }
    onEnd() {
        // called when the channel ends, either by interrupt or by completion
    }
    onTurnEnd(active: boolean) {
        // called every turn
    }
}