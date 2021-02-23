import Board from "../../../board";
import BoardPosition from "../../../board_position";
import Unit from "../../unit";
import AbilityTarget from "./ability_target";
import { AbilityEffectMask, BaseAbility, TargetType } from "./base_ability";

export abstract class LocationTargetedAbility extends BaseAbility {
    targetType = TargetType.Location;
    abstract collidesWith: AbilityEffectMask;

    isLocationValid(target: BoardPosition) {
        return true;
    }

    isValidWithTarget(target: AbilityTarget) {
        if (super.isValidWithTarget(target)) {
            return this.isLocationValid(target.location!);
        }
        return false;
    }

    _cast(target: AbilityTarget) {
        let unit = this.caster.board.getUnitAt(target.location!);
        if (unit) {
            if (this.canAffect(unit, this.collidesWith)) {
                this.onHitUnit(unit);
            }
        }
    }
}