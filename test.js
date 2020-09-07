import diceUtils from './docs/dice-utils.js';

for (let i = 0; i < 10; i++) {
    let tensDie = diceUtils.roll('d6').total
    let onesDie = diceUtils.roll('d6').total
    let d66Roll = parseInt('' + tensDie + onesDie, 10)
    console.debug('d66Roll:', d66Roll)
}
