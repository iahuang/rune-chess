import BoardPosition from "../../../board_position";
import { DamageType } from "../../../damage";
import { Effect } from "../../../effect";
import Unit from "../../unit";
import Champion from "../champion";
import AbilityTarget from "./ability_target";

export enum AbilityIdentifier {
    Q,
    W,
    E,
    R,
    None,
    P,
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

    static withBaseAmount(amount: number) {
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

export class AbilityCastError extends Error {
    reason: string;
    constructor(reason: string) {
        super("Ability could not be casted! Reason: "+reason);
        this.reason = reason;
    }
}

export abstract class BaseAbility {
    abstract identifier: AbilityIdentifier;
    abstract name: string;
    abstract targetType: TargetType;
    abstract description: string;
    costsActionPoint: boolean = true;
    maxRange: number | null = null;
    caster: Champion;
    private _castingDisabled: boolean = false;
    requiresMobility = false // if set to true, this ability cannot be cast while rooted

    voiceLines: string[] = [];

    // see https://github.com/microsoft/TypeScript/issues/24220#issuecomment-423785475
    private _metrics: { [type in AbilityMetricType]?: AbilityMetric };

    constructor(caster: Champion) {
        this.caster = caster;
        this._metrics = {};
        this.setMetrics();
    }

    get canBeCast() {
        return !this._castingDisabled;
    }

    disableCasting() {
        this._castingDisabled = true;
    }

    enableCasting() {
        this._castingDisabled = false;
    }

    get requiresTarget() {
        return this.targetType !== TargetType.None && this.targetType !== TargetType.Self;
    }

    abstract setMetrics(): void;

    addMetric(type: AbilityMetricType, metric: AbilityMetric) {
        this._metrics[type] = metric;
    }

    getMetric(type: AbilityMetricType) {
        return this._metrics[type] || null;
    }

    getMetricTypes() {
        return Object.keys(this._metrics) as AbilityMetricType[];
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

    _checkTargetTypeCompatibility(target: AbilityTarget) {
        if (this.targetType === TargetType.None) {
            return target.hasNoTarget;
        }
        if (this.targetType === TargetType.Self) {
            return target._unit === this.caster;
        }
        if (this.targetType === TargetType.Unit) {
            return target._unit !== null;
        }
        if (this.targetType === TargetType.Location) {
            return target._location !== null;
        }
        return false;
    }

    abstract _onCast(target: AbilityTarget): void;

    dealDamage(amount: number, to: Unit, type: DamageType) {
        this.caster.dealDamage(amount, to, type);
    }

    dealDamageToEnemyUnit(amount: number, to: Unit, type: DamageType) {
        if (to.teamColor !== this.caster.teamColor) {
            this.caster.dealDamage(amount, to, type);
        }
    }

    get board() {
        return this.caster.board;
    }

    _onTurnEnd(activeTurn: boolean) {
        if (activeTurn) {
            this.passivelyOnActiveTurnEnd();
        } else {
            this.passivelyOnInactiveTurnEnd();
        }
    }

    createAlliedEffect<T extends Effect>(EffectConstructor: new () => T, at: BoardPosition) {
        // Creates a new effect on the board that is allied to the ability caster
        return this.caster.board.createEffect(EffectConstructor, at, this.caster.teamColor);
    }

    passivelyOnActiveTurnEnd() {}

    passivelyOnInactiveTurnEnd() {}

    onUnitPlaced() {}

    canMaskAffect(unit: Unit, mask: AbilityEffectMask) {
        return mask.canAffect(this.caster, unit)
    }
}

export abstract class PassiveAbility extends BaseAbility {
    identifier = AbilityIdentifier.P;

    _onCast() {
        throw new Error("Cannot cast passive ability");
    }
    targetType = TargetType.None;
}

export class AbilityEffectMask {
    allyMinions = false;
    enemyMinions = false;

    allyChampions = false;
    enemyChampions = false;

    self = false;

    constructor() {}

    static allEnemyUnits() {
        let mask = new AbilityEffectMask();
        mask.allowEnemyChampionTarget().allowEnemyMinionTarget();
        return mask;
    }

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

    canAffect(caster: Unit, unit: Unit) {
        if (!this.self && caster === unit) {
            return false;
        }
        if (this.allyChampions && unit.isChampion && unit.teamColor === caster.teamColor) {
            return true;
        }

        if (this.enemyChampions && unit.isChampion && unit.teamColor !== caster.teamColor) {
            return true;
        }

        if (this.allyMinions && !unit.isChampion && unit.teamColor === caster.teamColor) {
            return true;
        }

        if (this.enemyMinions && !unit.isChampion && unit.teamColor !== caster.teamColor) {
            return true;
        }

        return false;
    }
}
