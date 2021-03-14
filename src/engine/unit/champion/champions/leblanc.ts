import { DamageType } from "../../../damage";
import { CCRooted } from "../../../status_effects_common/crowd_control";
import AbilityTarget from "../ability/ability_target";
import { AbilityEffectMask, AbilityIdentifier, AbilityMetric, AbilityMetricType } from "../ability/base_ability";
import { LocationTargetedAbility } from "../ability/location_target_ability";
import { UnitTargetedAbility } from "../ability/unit_targeted_ability";
import Champion from "../champion";

export class LeblancW extends LocationTargetedAbility {
    name = "Distortion";
    description =
        "LeBlanc blinks to the target location, dealing [DAMAGE] magic damage to all directly adjacent units where she lands. This ability may be recast in the following 2 turns to return where she casted it, displacing any units there.";
    identifier = AbilityIdentifier.W;
    requiresMobility = true;
    maxRange = 2;

    setMetrics() {
        this.addMetric(AbilityMetricType.Damage, AbilityMetric.withBaseAmount(75).setAPScaling(0.75));
    }

    onCast(target: AbilityTarget) {
        let landPos = target.getLocation();
        let board = this.board;
        if (board.hasUnitAt(landPos)) throw new Error("This ability cannot be cast where there is a unit");

        for (let pos of landPos.directlyAdjacentSquares()) {
            let unit = board.getUnitAt(pos);
            if (unit) {
                this.dealDamageToEnemyUnit(this.computeMetric(AbilityMetricType.Damage), unit, DamageType.Magic);
            }
        }
    }
}

export class LeblancE extends UnitTargetedAbility {
    name = "Ethreal Chains";
    description = "LeBlanc roots a chosen target for its next two active turns and deals [DAMAGE] magic damage";
    maxRange = 2;
    validTargets = AbilityEffectMask.allEnemyUnits();
    identifier = AbilityIdentifier.E;
    setMetrics() {
        this.addMetric(AbilityMetricType.Damage, AbilityMetric.withBaseAmount(50).setAPScaling(0.4));
    }

    onCast(target: AbilityTarget) {
        let unit = target.getUnit();
        this.dealDamage(this.computeMetric(AbilityMetricType.Damage), unit, DamageType.Magic);
        this.caster.applyStatusEffectTo(CCRooted, unit, 4);
    }
}

export class ChampionLeblanc extends Champion {
    name = "leblanc";
    displayName = "LeBlanc";
    riotName = "Leblanc";
    championTitle = "The Deceiver";
    displayedQuote = "For a moment I thought I'd broken a sweat.";
    constructor() {
        super({
            maxHP: 911,
            armor: 35,
            magicResistance: 31,
            abilityPower: 60,
            attackDamage: 68,
            attackRange: 2,
            ranged: true,
        });

        this.nicknames = ["lb", "lebonk"];
        this.abilityW = new LeblancW(this);
        this.abilityE = new LeblancE(this);
    }
}
