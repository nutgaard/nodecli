function sanitizeInput(input) {
    if (input.name && input.fn) {
      return input;
    } if (typeof input === 'function') {
        return {
            name: input.name,
            fn: input
        }
    } else {
      throw new Error('Illegal format: ' + JSON.stringify(input));
    }
}

function time(experiment) {
    return (...args) => {
        console.time(experiment.name);
        const res = experiment.fn(...args);
        console.timeEnd(experiment.name);
        return res;
    }
}

function test(fasit, experiment) {
    const fasitRunner = time(sanitizeInput(fasit));
    const experimentRunner = time(sanitizeInput(experiment));

    return (...args) => {
        const fasitRes = fasitRunner(...args);
        const experimentRes = experimentRunner(...args);

        if (JSON.stringify(fasitRes) !== JSON.stringify(experimentRes)) {
            console.error('Data not similar...', fasitRes, experimentRes);
        }

        return fasitRes;
    };
}

module.exports = {
    test
};