import Unit from "../unit";
import UnitAttributes from "../unit_attributes";
import { BaseAbility, NoAbility } from "./ability/base_ability";

export default class Champion extends Unit {
    abilityQ: BaseAbility = NoAbility();
    abilityW: BaseAbility = NoAbility();
    abilityE: BaseAbility = NoAbility();
    ultimate: BaseAbility = NoAbility();

    constructor(attributes: UnitAttributes) {
        super(attributes);
        this.isChampion = true;
    }
}