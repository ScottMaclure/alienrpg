# Alien RPG Tools

## What's this?

Generators and tools for the Alien RPG, by Free League Publishing. All content belongs to them.

* https://alien-rpg.com/
* https://frialigan.se/en/games/alien/

## Issues With Source Material

* Star system generator creates too many planets per system
* Ice planets have too weak correlation with temperature, it's easy to get hot/burning ice planets (ice planet -> size -> atmo -> temp) (add temp mod for ice planet?)
* Planetary names (what does LV/MT/RF stand for?)
* Planet size has a mod for GAS GIANT MOON: –4 (No supporting rules for colonising a gas giant moon?)
* No atmosphere = Desert World (Atmosphere table doesn't have a "no atmo" option, only "special"?)

## TODO

### Sooner

* [ ] Colony factions
* [ ] Colony allegiance
* [ ] Scenario hook per inhabited planet
* [ ] Full text-output star system generation, with details for the main world (i.e. the MVP)
* [ ] Uninhabited moons (If the planet is unexplored and uninhabited then simply roll D3–1 for the number of moons.)
* [ ] A gas giant has D6+4 significant moons which can be created just like Terrestrial Planets (define new type, hang off gas giant)
* [ ] Contract Fria Ligan for permission to use content for the generator

### Later

* [ ] Maintain a log of calculations, to display to UI later.
* [ ] Html interface with... Svelte?
* [ ] CSS via https://newcss.net/theme/terminal/
* [ ] Host on https://scott.maclure.info/alienrpg
* [ ] Unit test JS modules via https://github.com/avajs/ava
* [ ] Add Job Generator as another button
* [ ] Save/local state via localStorage

### Done

TBC... move done tasks here after each release.

#### 2020-09-07

* [x] 10+ on 2D6 = two competing colonies on the same world.
* [x] Ice planets - force temp to frozen (p340)
* [x] Add temperature min/max fields, generate average per planet
* [x] Sort planetary bodies by average temperature (p340)
* [x] Generate uninhabited planetary details for the rest of the system objects
