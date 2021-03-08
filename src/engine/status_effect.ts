import Unit from "./unit/unit";

export enum EffectType {
    Buff,
    Debuff,
    Hidden
}


export abstract class StatusEffect {
    abstract name: string;
    abstract description: string;
    abstract type: EffectType;
    effectDuration: number | null;
    
    source: Unit;   // the one who gave the status effect
    user: Unit;     // the one with the status effect
    timeLeft: number; // turns

    private _stacks: number;

    constructor(source: Unit, user: Unit, duration: number | null) {
        this.source = source;
        this.user = user;
        this.timeLeft = duration || 0;
        this.effectDuration = duration;
        this._stacks = 0;
    }

    addStack() {
        this._stacks+=1;
    }

    stacks() {
        return this._stacks;
    }

    resetStacks() {
        this._stacks = 0;
    }

    refreshEffect() {
        if (this.effectDuration === null) return;
        this.timeLeft = this.effectDuration;
    }

    _onTurnEnd(activeTurn: boolean) {
        if (activeTurn) {
            this.onActiveTurnEnd();
        } else {
            this.onInactiveTurnEnd();
        }
        if (this.effectDuration === null) return;
        this.timeLeft -= 1;
    }

    get shouldExpire() {
        if (this.effectDuration === null) return false;
        return this.timeLeft <= 0;
    }

    onApply() {

    }

    onExpire() {
        
    }

    onActiveTurnEnd() {

    }

    onInactiveTurnEnd() {

    }
}