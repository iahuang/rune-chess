# rune-chess

A Discord game based on Chess and Teamfight Tactics from League of Legends

This project's source code and assets are licensed under the MIT License. All other characters, art, and trademarks belong to Riot Games.

## Runechess Rules (v0.1)

These rules are subject to change as the game is developed.

The game is played on a 8x8 grid. Each side starts with six Minions and five Champions to be placed as the player wishes along the first two rows of that side.

### Unit

A Unit is the equivalent of a piece in Chess or a Unit in League of Legends' TFT. Champions are the equivalent of non-pawn Chess pieces, and Minions are the equivalent of pawns.

### Champions

Each Champion has one or more active ability, denoted by the descriptors Q, W, or E, and an ultimate ability, denoted by the letter R. A Champion may also have a passive ability. Abilities have a cooldown that dictates how frequently an ability may be used. Ultimate abilities cannot be cast more than once every three turns. The current Units are listed below.

**Distances and Units**

Lengths are measured in squares and distances do not use Euclidean distance. For example, the squares indicated by an `X` are 2 or fewer squares from the square indicated by an `O`

```
X X X X X
X X X X X
X X O X X
X X X X X
X X X X X
```

**Directly adjacent**

Refers to squares next to (or on top of) a square. Excludes diagonals.

**Displaced**

Units that are displaced are moved to the nearest empty space, prioritizing those directly adjacent, then corners. If there are no empty spaces, the Unit is displaced to an empty square 2 units away, and so on.

**Dashes to**

Certain mobility abilities allow Champions to move to occupied spaces. In this case, the empty square closest to the original spot is chosen. If all adjacent squares are occupied, the Unit in the square closest to the original spot is Displaced.

### Diana

**Q - Scorn of the Moon**

Cast on a tile in an L shape from Diana, similar to how a knight moves in Chess. Deals magic damage and afflicts any enemy Units with _Moonlight_.

**R - Moonfall**

All enemy champions in a 3x3 square around Diana take magic damage, scaling with the number of enemy champions in this radius.

### Fiora

**Q - Riposte**

For the following turn, Fiora becomes immune to enemy abilities. If a immobilizing effect is parried, all enemies in a 3x3 radius are Stunned.

**R - Grand Challenge**

Fiora marks a target within 3 squares. If the target dies within the next two turns, all allied Champions that dealt damage during this period are healed for % max HP.

### Ekko

**Q - Timewinder**

Ekko places a "temporal grenade" (as it is called in the League Wiki) two squares away in any cardinal direction, dealing magic damage.

On the following turn, the Q deals additional magic damage in the line from where it was placed, to where Ekko originally cast it.

**R - Chronobreak**

Ekko returns to his position four turns ago, dealing magic damage to those directly adjacent and healing for % max HP. Ekko Displaces any Units present where he lands.
