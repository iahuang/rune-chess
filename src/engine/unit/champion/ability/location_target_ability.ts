import Board from "../../../board";
import BoardPosition from "../../../board_position";
import Unit from "../../unit";
import AbilityTarget from "./ability_target";
import { AbilityEffectMask, BaseAbility, TargetType } from "./base_ability";

export abstract class LocationTargetedAbility extends BaseAbility {
    targetType = TargetType.Location;

    isLocationValid(target: BoardPosition) {
       
        return true;    
    }

    checkTargetValidity(target: AbilityTarget) {
        if (this.maxRange !== null) {
            return BoardPosition.manhattanDistance(this.caster.pos, target.getLocation()) <= this.maxRange;
        }
        return this.isLocationValid(target.getLocation());
    }

    onCast(target: AbilityTarget) {
    }
}