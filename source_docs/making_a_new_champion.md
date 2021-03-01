# Runechess - Guide to Implementing a New Champion

Here's an example:

```ts
class ChampionChampName extends Champion {
    constructor() {
        super({
            maxHP: 816,
            armor: 41,
            magicResistance: 31,
            abilityPower: 0,
            attackDamage: 50,
            attackRange: 2,
            ranged: true,
        });

        this.name = "ChampName";
        this.abilityQ = new ChampQ(this);
        this.abilityW = new ChampW(this);
        this.abilityE = new ChampE(this);
        this.abilityR = new ChampR(this);
    }
}

export default function Champ() {
    return new ChampionChampName();
}
```

Notice a few things:
- The only function exposed by the module is a factory function simply called `Champ` that creates an instance of the new champion.
- `Champion.constructor` only takes one argument, this being the stats of the champ
- `Champion.ability[Q,W,E,R]`, if not set in the constructor, defaults to an empty ability defined in `ability/base_ability.ts` called `_NoAbility`
- Classes `Champ[Q,W,E,R]` are subclasses of `BaseAbility`, defined in `ability/base_ability.ts`. See this file for more details