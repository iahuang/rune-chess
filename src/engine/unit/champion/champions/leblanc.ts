import { DamageType } from "../../../damage";
import AbilityTarget from "../ability/ability_target";
import { AbilityIdentifier, AbilityMetric, AbilityMetricType } from "../ability/base_ability";
import { LocationTargetedAbility } from "../ability/location_target_ability";
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

export class ChampionLeblanc extends Champion {
    name = "leblanc";
    displayName = "LeBlanc";
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
    }
}
