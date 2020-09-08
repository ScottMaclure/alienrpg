var isMultiplier = (str) => {
  if (typeof str === 'string') {
    return /[xX*]{1}[\d]{1,}/.test(str);
  }
  return false;
};

var isFudge = (sides) => (!!((sides && sides.toString().toUpperCase() === 'F')));

var isDropLowest = (mod) => !!(mod && mod.toString().toUpperCase() === '-L');

var isSuccessCount = (mod) => !!(mod && /[<>]{1}[\d]{1,}/.test(mod));

/**
 * Parse a die notation string.
 * @param {int} diceString - A die notation string ie "1d20+5".
 * @return {object} An object containing the parsed components of the die string.
 */
var parseDieNotation = (diceString) => {
  if (typeof diceString !== 'string') {
    throw new Error('parseDieNotation must be called with a dice notation string');
  }

  const parts = diceString.toLowerCase().split('d');
  const count = parseInt(parts[0], 10) || 1;
  const sides = isFudge(parts[1]) ? 'F' : parseInt(parts[1], 10);
  let mod = 0;
  const result = {
    count,
    sides,
  };

  if (Number.isNaN(Number(parts[1]))) {
    // die notation includes a modifier
    const modifierMatch = /[+-xX*<>]{1}[\dlL]{1,}/;
    const matchResult = parts[1].match(modifierMatch);
    if (matchResult) {
      if (isMultiplier(matchResult[0])) {
        result.multiply = true;
        mod = parseInt(matchResult[0].substring(1), 10);
      } else if (isDropLowest(matchResult[0])) {
        mod = 0;
        result.dropLow = true;
      } else if (isSuccessCount(matchResult[0])) {
        const highOrLow = matchResult[0].charAt(0);
        result.success = highOrLow === '>' ? 1 : -1;
        mod = parseInt(matchResult[0].substring(1), 10);
      } else {
        mod = parseInt(matchResult[0], 10);
      }
    }
  }
  result.mod = mod;

  return result;
};

/**
 * Generate a random number between 1 and sides.
 * @param {int} sides - The number of sides on the die.
 * @param {function} randFn - A function that returns a pseudorandom float between 0 and 1.
 * @return {int} The number rolled.
 */
var rollDie = (sides, randFn = Math.random) => {
  if (!isFudge(sides) && !Number.isInteger(sides)) {
    throw new Error('rollDie must be called with an integer or F');
  }

  if (isFudge(sides)) {
    return Math.ceil(randFn() * 2) - 1;
  }

  return Math.ceil(randFn() * (sides - 1) + 1);
};

const getTotal = (results, options) => {
  const {
    mod, multiply, dropLow, success,
  } = options;
  let resultCopy = [...results];
  let total = 0;

  if (dropLow) {
    (resultCopy = resultCopy.sort((a, b) => a - b)).shift();
  }

  if (success) {
    resultCopy.forEach((v) => {
      if ((success < 0 && v <= mod) || (success > 0 && v >= mod)) {
        total += 1;
      }
    });
  } else {
    resultCopy.forEach((v) => {
      total += v;
    });

    if (multiply) {
      total *= mod;
    } else if (mod) {
      total += mod;
    }
  }

  return total;
};

/**
 * Parse a die notation string, roll the individual dice, and return the total
 * accounting for any modifiers.
 * @param {int} diceString - A die notation string ie "1d20+5".
 * @param {function} randFn - A function that returns a pseudorandom float between 0 and 1.
 * @return {object} An object containing the results of the invididual die rolls and the
 * total of the modified sum.
 */
var roll = (diceString, randFn = Math.random) => {
  const {
    count, sides, mod, multiply, dropLow, success,
  } = parseDieNotation(diceString);
  const results = [];

  for (let i = 0; i < count; i += 1) {
    const currentResult = rollDie(sides, randFn);
    results.push(currentResult);
  }

  return {
    results,
    total: getTotal(results, {
      mod, multiply, dropLow, success,
    }),
  };
};

var index = {
  parseDieNotation,
  rollDie,
  roll,
};

export default index;
