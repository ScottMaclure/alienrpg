import utils from './docs/utils.js';

const test_rollD66 = () => {

    for (let i = 0; i < 20; i++) {
        let total = utils.rollD66()
        console.debug(`base total=${total}`)
    }

    for (let i = -20; i < 20; i++) {
        let total = utils.rollD66(i) // i == tensmod
        console.debug(`mod=${i}, total=${total}`)
    }

}

test_rollD66()
