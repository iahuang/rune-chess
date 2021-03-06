import BoardPosition from "../../../board_position";
import Unit from "../../unit";
import AbilityTarget from "./ability_target";
import { AbilityEffectMask, BaseAbility, TargetType } from "./base_ability";

export abstract class UnitTargetedAbility extends BaseAbility {
    abstract validTargets: AbilityEffectMask;

    unitFilter(unit: Unit) {
        return true;
    }

    checkTargetValidity(target: AbilityTarget) {
        if (this.maxRange !== null) {
            if (BoardPosition.manhattanDistance(this.caster.pos, target.getUnit().pos) > this.maxRange) {
                return false;
            }
        }
        if (!this.canMaskAffect(target.getUnit(), this.validTargets)) return false;
        return this.unitFilter(target.getUnit());
    }

    targetType = TargetType.Unit;
}
