# Alien RPG Tools

## What's this?

Generators and tools for the Alien RPG, by Free League Publishing. All content belongs to them.

* https://alien-rpg.com/
* https://frialigan.se/en/games/alien/

## Issues With Source Material

* Star system generator creates too many planets per system
* Planetary names (what does LV/MT/RF stand for?)
* No atmosphere = Desert World (Atmosphere table doesn't have a "no atmo" option, only "special"?)

## TODO

### Sooner

* [ ] Html interface with... Svelte?
* [ ] CSS via https://newcss.net/theme/terminal/
* [ ] Host on https://scott.maclure.info/alienrpg
* [ ] Uninhabited moons: If the planet is unexplored and uninhabited then simply roll D3–1 for the number of moons. (Refactor orbitals to be habitation/colony independent?)
* [ ] A gas giant has D6+4 significant moons which can be created just like Terrestrial Planets (define new type, hang off gas giant)

### Later

* [ ] Maintain a log of calculations, to display to UI later.
* [ ] Setup Unit test framework for JS modules via https://github.com/avajs/ava
* [ ] Add Job Generator as another button
* [ ] Save/local state via localStorage
* [ ] Full unit-test coverage
* [ ] Cypress test suite
* [ ] CI/CD pipeline to run tests? Travis? Netlify? Github actions?

### Done

#### 2020-09-08

* [x] Colony factions
* [x] Colony allegiance
* [x] Fix ice planet data (d66 -> 2d6, oops)
* [x] Scenario hook per inhabited planet
* [x] Add app data in prep for web interface
* [x] Full text-output star system generation, with details for the main world (i.e. the MVP)

#### 2020-09-07

* [x] Contract Fria Ligan for permission to use content for the generator
* [x] 10+ on 2D6 = two competing colonies on the same world.
* [x] Ice planets - force temp to frozen (p340)
* [x] Add temperature min/max fields, generate average per planet
* [x] Sort planetary bodies by average temperature (p340)
* [x] Generate uninhabited planetary details for the rest of the system objects
