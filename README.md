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

### Sooner

* Run through star system generator materials, checking with data and code for correctness (testing)
* Add Mission Job generator
* Add Expedition Job generator

### Later

* Add Encounter generators (star system encounter, ship reaction, on-planet)
* Add an "About" page with details on the app and the author, with some links - again easier to discover for Users.
* Add roadmap as a page in the app itself, so users can easily check and see what's planned / done etc (would be a "page")
* Write unit tests for the Star Systems generator module (more important than the utils module, as bugs are less visible)
* Add routing for multiple page support (https://routify.dev/, or maybe just page.js, but I want code splitting too!)
* Maintain a log of calculations, to display to UI later
* Full unit-test coverage for all modules
* Cypress test suite for UAT
* CI/CD pipeline to automate deployments? Travis? Netlify? Github actions? (for now it's npm run deploy from local)

### Changelog

#### 2020-09-10

* Fix planetary names logic, see p331. Add "surveyed" chance, 3 digit designation.
* Change version to (sed replaced) timestamp, move to footer
* npm deploy bumps the version date
* Uninhabited moons: If planet is unexplored/uninhabited, roll D3–1 for moons. (Refactor orbitals to be habitation/colony independent, give them an optional owner, update printing logic)
* Asteroid belts aren't surveyable (so they'll never get a name, etc)
* A gas giant has D6+4 significant moons which can be created just like Terrestrial Planets (define new type, hang off gas giant, refactor habitation code, printing code, etc)
* Refactor the "options" UI into its own (nested) component
* Enhance options with a hide/show UI
* Refactor options & results to handle multiple generators (star systems, jobs, encounters)
* Add Cargo Run Job generator (as another module+button)

#### 2020-09-09

* sessionStorage to remember options & results (safer than localStorage, which can break the app on code updates if you're not careful)
* Allow user to set/override the location of the system in advance (e.g. Frontier, UPP, etc) (also update for cli.js)

#### 2020-09-08

* Colony factions
* Colony allegiance
* Fix ice planet data (d66 -> 2d6, oops)
* Scenario hook per inhabited planet
* Add app data in prep for web interface
* Full text-output star system generation, with details for the main world (i.e. the MVP)
* Html interface with... Svelte?
* CSS via https://newcss.net/theme/terminal/
* Host on https://scott.maclure.info/alienrpg
* Add "show uninhabited details" checkbox
* Setup Unit test framework for JS modules via https://github.com/avajs/ava
* Bug - certain runs are hanging - infloop? Debug.

#### 2020-09-07

* Contract Fria Ligan for permission to use content for the generator
* 10+ on 2D6 = two competing colonies on the same world.
* Ice planets - force temp to frozen (p340)
* Add temperature min/max fields, generate average per planet
* Sort planetary bodies by average temperature (p340)
* Generate uninhabited planetary details for the rest of the system objects
