import BoardPosition from "../../../board_position";
import { AbilityEffectMask, AbilityIdentifier, AbilityMetric, AbilityMetricType } from "../ability/base_ability";
import { LocationTargetedAbility } from "../ability/location_target_ability";
import { UnitTargetedAbility } from "../ability/unit_targeted_ability";
import Champion from "../champion";

class MalzaharE extends UnitTargetedAbility {
    name = "Malefic Visions";
    description = "Malzahar infects a target";
    maxRange = 2;
    identifier = AbilityIdentifier.E;
    validTargets = AbilityEffectMask.allEnemyUnits();
    isLocationValid(pos: BoardPosition) {
        return false;
    }
    onCast() {}

    setMetrics() {
        this.addMetric(AbilityMetricType.Damage, AbilityMetric.withBaseAmount(80).setAPScaling(0.8));
    }
}

export class ChampionMalzahar extends Champion {
    name = "malzahar";
    displayName = "Malzahar";
    championTitle = "Prophet of the Void";
    displayedQuote = "Icathia beckons.";

    constructor() {
        super({
            maxHP: 880,
            armor: 32,
            magicResistance: 31,
            abilityPower: 60,
            attackDamage: 66,
            attackRange: 2,
            ranged: true,
        });

        this.nicknames = ["malz"];
        this.abilityE = new MalzaharE(this);
    }
}
