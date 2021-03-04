import BoardPosition from "../../../board_position";
import { AbilityIdentifier, AbilityMetric, AbilityMetricType } from "../ability/base_ability";
import { LocationTargetedAbility } from "../ability/location_target_ability";
import Champion from "../champion";

class MalzaharQ extends LocationTargetedAbility {
    name = "Call of the Void";
    description = "None";
    identifier = AbilityIdentifier.Q;
    nicknames = ["malz"];
    isLocationValid(pos: BoardPosition) {
        return false;
    }
    onCast() {

    }

    setMetrics() {
        this.addMetric(AbilityMetricType.Damage, AbilityMetric.withBaseAmount(90).setAPScaling(0.7));
    }
}

export class ChampionMalzahar extends Champion {
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

        this.name = "Malzahar";
        this.abilityQ = new MalzaharQ(this);
    }
}