# Alien RPG Tools

## What's this?

Generators and tools for the Alien RPG, by Free League Publishing. All content belongs to them.

* https://alien-rpg.com/
* https://frialigan.se/en/games/alien/

## Local Development

```bash
# Install deps first
npm i

# Run with live reload
npm run dev

# Build prod assets
npm build
npm start
```

http://localhost:5000/

## Issues With Source Material

* Star system generator creates too many planets per system.
* No atmosphere = Desert World (Atmosphere table doesn't have a "no atmo" option, only "special"?).
* Planetary names (what does LV/MT/RF stand for?).
* No given chance for "surveyed", non-colonised moons and planets (p331).
* Gas giant planet size should be huge? The moons have -4, but the gas giant iself should be large?

## Roadmap

### v1.0.0

* [ ] Refactor the "options" UI into its own (nested) component, with a hide/show UI
* [ ] Run through star system generator materials, checking with data and code for correctness (testing)

### Someday maybe

* [ ] Refactor options & results to handle multiple generators (star systems, jobs, encounters)
* [ ] Add Job generator (as another module+button)
* [ ] Add Encounter generators (star system encounter, ship reaction, on-planet)
* [ ] Add an "About" page with details on the app and the author, with some links - again easier to discover for Users.
* [ ] Add roadmap as a page in the app itself, so users can easily check and see what's planned / done etc (would be a "page")
* [ ] Write unit tests for the Star Systems generator module (more important than the utils module, as bugs are less visible)
* [ ] Add routing for multiple page support (https://routify.dev/, or maybe just page.js, but I want code splitting too!)
* [ ] Maintain a log of calculations, to display to UI later
* [ ] Full unit-test coverage for all modules
* [ ] Cypress test suite for UAT
* [ ] CI/CD pipeline to automate deployments? Travis? Netlify? Github actions? (for now it's npm run deploy from local)

### Changelog

#### 2020-09-10

* [x] Fix planetary names logic, see p331. Add "surveyed" chance, 3 digit designation.
* [x] Change version to (sed replaced) timestamp, move to footer
* [x] npm deploy bumps the version date
* [x] Uninhabited moons: If planet is unexplored/uninhabited, roll D3–1 for moons. (Refactor orbitals to be habitation/colony independent, give them an optional owner, update printing logic)
* [x] Asteroid belts aren't surveyable (so they'll never get a name, etc)
* [x] A gas giant has D6+4 significant moons which can be created just like Terrestrial Planets (define new type, hang off gas giant, refactor habitation code, printing code, etc)

#### 2020-09-09

* [x] sessionStorage to remember options & results (safer than localStorage, which can break the app on code updates if you're not careful)
* [x] Allow user to set/override the location of the system in advance (e.g. Frontier, UPP, etc) (also update for cli.js)

#### 2020-09-08

* [x] Colony factions
* [x] Colony allegiance
* [x] Fix ice planet data (d66 -> 2d6, oops)
* [x] Scenario hook per inhabited planet
* [x] Add app data in prep for web interface
* [x] Full text-output star system generation, with details for the main world (i.e. the MVP)
* [x] Html interface with... Svelte?
* [x] CSS via https://newcss.net/theme/terminal/
* [x] Host on https://scott.maclure.info/alienrpg
* [x] Add "show uninhabited details" checkbox
* [x] Setup Unit test framework for JS modules via https://github.com/avajs/ava
* [x] Bug - certain runs are hanging - infloop? Debug.

#### 2020-09-07

* [x] Contract Fria Ligan for permission to use content for the generator
* [x] 10+ on 2D6 = two competing colonies on the same world.
* [x] Ice planets - force temp to frozen (p340)
* [x] Add temperature min/max fields, generate average per planet
* [x] Sort planetary bodies by average temperature (p340)
* [x] Generate uninhabited planetary details for the rest of the system objects
