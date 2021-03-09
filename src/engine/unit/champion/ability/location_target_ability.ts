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

    checkTargetValidity(target: AbilityTarget) {
        return this.isLocationValid(target.getLocation());
    }

    onCast(target: AbilityTarget) {
    }
}