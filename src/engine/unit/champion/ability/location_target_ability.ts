import Board from "../../../board";
import BoardPosition from "../../../board_position";
import Unit from "../../unit";
import AbilityTarget from "./ability_target";
import { AbilityEffectMask, BaseAbility, TargetType } from "./base_ability";

export abstract class LocationTargetedAbility extends BaseAbility {
    targetType = TargetType.Location;

    isLocationValid(target: BoardPosition) {
        if (this.maxRange !== null) {
            return BoardPosition.withinSquare(this.caster.pos, target, this.maxRange);
        }
        return true;    
    }

    _isValidWithTarget(target: AbilityTarget) {
        if (super._isValidWithTarget(target)) {
            return this.isLocationValid(target.location!);
        }
        return false;
    }

    onCast(target: AbilityTarget) {
    }
}