import Board from "../../../board";
import BoardPosition from "../../../board_position";
import Unit from "../../unit";
import { BaseAbility, TargetType } from "./base_ability";

export abstract class LocationTargetedAbility extends BaseAbility {
    targetType = TargetType.Location;
    isLocationValid(caster: Unit, target: BoardPosition, board: Board) {
        return true;
    }
}