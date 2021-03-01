import Unit from "./unit/unit";

export enum EffectType {
    Buff,
    Debuff,
    Hidden
}


export class StatusEffect {
    name: string = "generic_effect";
    description: string = "null";
    type: EffectType = EffectType.Hidden;
    effectDuration: number;
    
    source: Unit;   // the one who gave the status effect
    user: Unit;     // the one with the status effect
    durationLeft: number; // turns

    constructor(source: Unit, user: Unit, duration: number) {
        this.source = source;
        this.user = user;
        this.durationLeft = 0; // temporarily initialized
        this.effectDuration = duration;
    }

    refreshEffect() {
        this.durationLeft = this.effectDuration;
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