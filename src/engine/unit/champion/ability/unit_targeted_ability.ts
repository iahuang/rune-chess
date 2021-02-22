import { BaseAbility, TargetType } from "./base_ability";

export class AbilityValidTarget {
    allyMinions = false;
    enemyMinions = false;
    
    allyChampions = false;
    enemyChampions = false;

    self = false;

    constructor() {

    }

    allowEnemyMinionTarget() {
        this.enemyMinions = true;
        return this;
    }

    allowEnemyChampionTarget() {
        this.enemyChampions = true;
        return this;
    }
}

export abstract class UnitTargetedAbility extends BaseAbility {
    abstract validTargets: AbilityValidTarget;
    targetType = TargetType.Unit;
    constructor() {
        super();
    }
}