import Unit from "../../unit";
import AbilityTarget from "./ability_target";

export enum AbilityIdentifier {
    Q,
    W,
    E,
    R,
    None,
}

export enum TargetType {
    None, // passive or other
    Self, // self-targeted
    Unit, // targets a unit
    Location, // targets a specific point on the board
}

export enum AbilityMetricType {
    Damage = "DAMAGE",
    SecondaryDamage = "SECONDARY_DAMAGE",
    TertiaryDamage = "TERTIARY_DAMAGE",
    Healing = "HEALING",
    Shielding = "SHIELDING",
    EffectDuration = "EFFECT_DURATION",
}

export class AbilityMetric {
    apScaling?: number;
    adScaling?: number;
    casterMaxHPScaling?: number;
    targetMaxHPScaling?: number;
    baseAmount: number;

    private constructor(amount: number) {
        this.baseAmount = amount;
    }

    withBaseAmount(amount: number) {
        return new AbilityMetric(amount);
    }

    setAPScaling(factor: number) {
        this.apScaling = factor;
        return this;
    }

    setADScaling(factor: number) {
        this.adScaling = factor;
        return this;
    }

    setCasterMaxHPScaling(factor: number) {
        this.casterMaxHPScaling = factor;
        return this;
    }

    setTargetMaxHPScaling(factor: number) {
        this.targetMaxHPScaling = factor;
        return this;
    }
}

export abstract class BaseAbility {
    abstract identifier: AbilityIdentifier;
    abstract name: string;
    abstract targetType: TargetType;
    abstract description: string;
    maxRange: number | null = null;
    caster: Unit;

    // see https://github.com/microsoft/TypeScript/issues/24220#issuecomment-423785475
    private _metrics: { [type in AbilityMetricType]?: AbilityMetric };

    constructor(caster: Unit) {
        this.caster = caster;
        this._metrics = {};
    }

    addMetric(type: AbilityMetricType, metric: AbilityMetric) {
        this._metrics[type] = metric;
    }

    getMetric(type: AbilityMetricType) {
        return this._metrics[type] || null;
    }

    computeMetric(type: AbilityMetricType, unitTarget?: Unit) {
        let metric = this.getMetric(type);
        if (!metric) throw new Error(`Ability ${this.name} does not have metric of type ${type}`);

        if (metric.targetMaxHPScaling && !unitTarget) {
            throw new Error("Metric with target max HP scaling requires unit target");
        }

        let amount = metric.baseAmount;
        let caster = this.caster;

        if (metric.adScaling) amount += caster.calculateAD();
        if (metric.apScaling) amount += caster.calculateAD();
        if (metric.casterMaxHPScaling) amount += caster.calculateMaxHP();
        if (metric.targetMaxHPScaling) amount += unitTarget!.calculateMaxHP();

        return amount;
    }

    get isUltimate() {
        return this.identifier === AbilityIdentifier.R;
    }

    _isValidWithTarget(target: AbilityTarget) {
        if (this.targetType === TargetType.None) {
            return target.hasNoTarget;
        }
        if (this.targetType === TargetType.Self) {
            return target.unit === this.caster;
        }
        if (this.targetType === TargetType.Unit) {
            return target.unit !== null;
        }
        if (this.targetType === TargetType.Location) {
            return target.location !== null;
        }
        return false;
    }

    abstract onCast(target: AbilityTarget): void;

    canAffect(unit: Unit, mask: AbilityEffectMask) {
        if (mask.allyChampions && unit.isChampion && unit.teamColor === this.caster.teamColor) {
            return true;
        }

        if (mask.enemyChampions && unit.isChampion && unit.teamColor !== this.caster.teamColor) {
            return true;
        }

        if (mask.allyMinions && !unit.isChampion && unit.teamColor === this.caster.teamColor) {
            return true;
        }

        if (mask.enemyMinions && !unit.isChampion && unit.teamColor !== this.caster.teamColor) {
            return true;
        }

        return false;
    }
}

class _NoAbility extends BaseAbility {
    name = "None";
    description = "null";
    identifier = AbilityIdentifier.None;
    targetType = TargetType.None;

    onCast(target: AbilityTarget) {}
}

export function NoAbility(caster: Unit) {
    return new _NoAbility(caster);
}

export class AbilityEffectMask {
    allyMinions = false;
    enemyMinions = false;

    allyChampions = false;
    enemyChampions = false;

    self = false;

    constructor() {}

    allowEnemyMinionTarget() {
        this.enemyMinions = true;
        return this;
    }

    allowEnemyChampionTarget() {
        this.enemyChampions = true;
        return this;
    }

    allowAllyMinionTarget() {
        this.allyMinions = true;
        return this;
    }

    allowAllyChampionTarget() {
        this.allyChampions = true;
        return this;
    }

    allowSelfTarget() {
        this.self = true;
        return this;
    }

    allowAll() {
        this.enemyChampions = true;
        this.enemyMinions = true;
        this.allyChampions = true;
        this.allyMinions = true;
        return this;
    }
}
