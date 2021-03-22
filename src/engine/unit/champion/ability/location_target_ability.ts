import Board from "../../../board";
import BoardPosition from "../../../board_position";
import Unit from "../../unit";
import AbilityTarget from "./ability_target";
import { AbilityCastError, AbilityEffectMask, BaseAbility, TargetType } from "./base_ability";

export abstract class LocationTargetedAbility extends BaseAbility {
    targetType = TargetType.Location;

    _checkTargetValidity(target: AbilityTarget) {
        
    }

    abstract onCast(at: BoardPosition): void;

    _onCast(target: AbilityTarget) {
        if (this.maxRange !== null) {
            let outOfRange = BoardPosition.manhattanDistance(this.caster.pos, target.getLocation()) > this.maxRange;

            if (outOfRange) {
                throw new AbilityCastError("Target out of range");
            }
        }
        this.onCast(target.getLocation());
    }
}