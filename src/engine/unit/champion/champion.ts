import { randomItem } from "../../util/rand";
import Unit from "../unit";
import UnitAttributes from "../unit_attributes";
import UnitType from "../unit_type";
import AbilityTarget from "./ability/ability_target";
import { AbilityIdentifier, BaseAbility } from "./ability/base_ability";

export default abstract class Champion extends Unit {
    abilityQ: BaseAbility | null = null;
    abilityW: BaseAbility | null = null;
    abilityE: BaseAbility | null = null;
    abilityR: BaseAbility | null = null;

    championTitle: string = "null";
    nicknames: string[] = [];

    private _currentVoiceLine: string | null = null;

    constructor(attributes: UnitAttributes) {
        super(attributes);
        this.unitType = UnitType.Champion;
    }

    say(message: string) {
        this._currentVoiceLine = message;
    }
    sayRandom(lines: string[]) {
        this.say(randomItem(lines));
    }
    clearVoiceLine() {
        this._currentVoiceLine = null;
    }
    getCurrentVoiceLine() {
        return this._currentVoiceLine;
    }

    getAbilityByIdentifier(identifier: AbilityIdentifier) {
        let ability = {
            [AbilityIdentifier.Q]: this.abilityQ,
            [AbilityIdentifier.W]: this.abilityW,
            [AbilityIdentifier.E]: this.abilityE,
            [AbilityIdentifier.R]: this.abilityR,
            [AbilityIdentifier.None]: null,
        }[identifier];

        return ability;
    }

    castAbility(which: AbilityIdentifier, target: AbilityTarget) {
        let ability = this.getAbilityByIdentifier(which);
        if (!ability) {
            throw new Error(`Ability ${AbilityIdentifier[which]} does not exist on champion ${this.name}`);
        }
        if (!ability._isValidWithTarget(target)) {
            throw new Error("cannot cast ability onto target of type " + target.targetType);
        }

        ability._onCast(target);
    }
}
