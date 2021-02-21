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

Units that are displaced are moved to a random adjacent empty space, prioritizing those directly adjacent, then corners. If there are no empty spaces, the Unit is displaced to an empty square 2 units away, and so on.

**Dashes to**

Certain mobility abilities allow Champions to move to occupied spaces. In this case, the empty square closest to the original spot is chosen. If all adjacent squares are occupied, the Unit in the square closest to the original spot is Displaced.

### Diana

**Q - Scorn of the Moon**

Cast on a tile in an L shape from Diana, similar to how a knight moves in Chess. Deals magic damage and afflicts any enemy Units with _Moonlight_.

**R - Moonfall**

All enemy champions in a 3x3 square around Diana take magic damage, scaling with the number of enemy champions in this radius.

### Fiora

**W - Riposte**

For the following turn, Fiora becomes immune to enemy abilities. If a immobilizing effect is parried, all enemies in a 3x3 radius are Stunned.

**R - Grand Challenge**

Fiora marks a target within 3 squares. If the target dies within the next two turns, all allied Champions that dealt damage during this period are healed for % max HP.

### Ekko

**Q - Timewinder**

Ekko places a "temporal grenade" (as it is called in the League Wiki) two squares away in any cardinal direction, dealing magic damage.

On the following turn, the Q deals additional magic damage in the line from where it was placed, to where Ekko originally cast it.

**R - Chronobreak**

Ekko returns to his position four turns ago, dealing magic damage to those directly adjacent and healing for % max HP. Ekko Displaces any Units present where he lands.

### Jax

**P - Grandmaster at Arms**

Each consecutive Basic Attack on a target does extra damage. 

**E - Counter Strike**

Jax enters a defensive stance, blocking all Basic Attacks for the following turn. On the turn after that, all enemy Units directly adjacent to Jax are Stunned.

### Tryndamere

**W - Mocking Shout**

Lowers the base AD of enemy Champions within three squares for the next turn.

**R - Grasp of the Undying**

Tryndamere cannot be reduced below 50 HP for the next two turns.

### Sylas

**W - Kingslayer**

Sylas attacks a directly adjacent enemy Unit, healing and dealing magic damage. Cannot be cast while rooted.

**R - The Unshackled**

Sylas casts the ultimate of a chosen Champion on the enemy team.

### Aphelios

**Q - Weapon of the Faithful**

Aphelios casts his active weapon

- Calibrum - Deals % max HP physical damage to a target up to 3 squares away.
- Severum - Heals for every enemy Champion within 1 square, and deals physical damage
- Gravitum - Roots a target enemy Champion within 2 squares, and deals physical damage

**W - Phase**

Aphelios cycles his active weapon. This ability may be used independently of your turn's actions, and has no cooldown.

### Anivia

**P - Rebirth**

Upon dying, Anivia reverts to an egg and is reborn at full health, unless the egg is destroyed. Anivia cannot cast abilities or move while in egg form.

**W - Crystallize**

Anivia creates an ice wall that takes up 1 square and lasts for two turns. If casted on an occupied square, the occupying Unit is Displaced.

### Teemo

**Q - Blinding Dart**

Teemo blinds an enemy Unit up to two squares away, preventing them from performing auto attacks for the three turns.

**R - Noxious Trap**

Teemo places a shroom in a directly adjacent square. The shroom lasts until tripped by an ally or enemy Unit. If tripped by an enemy Unit, it deals magic damage to all units within 1 square.

### Katarina

**Q - Bouncing Blade**

Katarina throws a blade onto an enemy Unit within 1 square, which then bounces to a directly adjacent enemy Unit.

**E - Shunpo**

Katarina dashes to a square up to two squares away that is directly adjacent to an enemy or allied Unit. If next to an enemy Unit, Katarina applies a Basic Attack to the lowest health Unit, prioritizing Champions.

**R - Death Lotus**

Katarina enters her ultimate stance, dealing magic damage to all enemies within 1 square for the next two turns. Will be cancelled if Katarina is immobilized.

## Game Structure

The game starts with each player alternating placing one Unit on their board, starting with the Champions, then the Minions.

The game alternates between the two players, each able to move a Unit, cast an Ability, *or* perform a Basic Attack on their turn. Ultimate abilities may only be cast once per Champion.

The game ends once one team's Champions have all been killed.