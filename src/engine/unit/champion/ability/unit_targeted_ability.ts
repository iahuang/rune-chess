import BoardPosition from "../../../board_position";
import Unit from "../../unit";
import AbilityTarget from "./ability_target";
import { AbilityEffectMask, BaseAbility, TargetType } from "./base_ability";

export abstract class UnitTargetedAbility extends BaseAbility {
    abstract validTargets: AbilityEffectMask;

    unitFilter(unit: Unit) {
        return true;
    }

    _isValidWithTarget(target: AbilityTarget) {
        if (!super._isValidWithTarget(target)) {
            return false;
        }

        if (this.maxRange !== null) {
            if (!BoardPosition.withinSquare(this.caster.pos, target.location!, this.maxRange)) {
                return false;
            }
        }

        return this.unitFilter(target.unit!);
    }
    
    targetType = TargetType.Unit;
}