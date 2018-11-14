function wrap(context, fn) {
    return new GeneratorUtils(context, fn);
}

function* combiner(fixedValue, genFn) {
    const gen = genFn(fixedValue).generator;
    for (const val of gen) {
        yield [ fixedValue, val ];
    }
    return;
}

function flatten(ary) {
    var ret = [];
    for(var i = 0; i < ary.length; i++) {
        if(Array.isArray(ary[i])) {
            ret = ret.concat(flatten(ary[i]));
        } else {
            ret.push(ary[i]);
        }
    }
    return ret;
}

function stepGenerator(initialValue, initialStep, stepSize) {
    return function*() {
        let number = initialValue;
        let step = initialStep;

        while (true) {
            yield number;
            number += step;
            step += stepSize;
        }
    }
}

class GeneratorUtils {
    static naturalnumbers(startFrom = 0, step = 1) {
        return wrap(null, function*() {
            let value = startFrom;
            while (true) {
                yield value;
                value += step;
            }
        });
    }

    static range(start, stop, step = 1) {
        return GeneratorUtils.naturalnumbers(start, step)
            .takeWhile((val) => val < stop + step);
    }

    static doublefor(start, stop) {
        return wrap(null, function*() {
            for (let i = start; i < stop; i++) {
                for (let j = i + 1; j < stop; j++) {
                    yield [i, j];
                }
            }
        });
    }

    static trippelfor(start, stop) {
        return wrap(null, function*() {
            for (let i = start; i < stop; i++) {
                for (let j = i + 1; j < stop; j++) {
                    for (let k = j + 1; k < stop; k++) {
                        yield [i, j, k];
                    }
                }
            }
        });
    }

    static ofArray(arr) {
        return wrap(null, function*() {
            for (const val of arr) {
                yield val;
            }
        });
    }

    static cyclicOfArray(arr) {
        return wrap(null, function*() {
            while (true) {
                yield* GeneratorUtils.ofArray(arr).generator;
            }
        });
    }

    constructor(context, fn) {
        this.context = context;
        this.fn = fn;
        this.generator = fn.call(context);
    }

    takeWhile(predicate) {
        return wrap(this, function*() {
            let index = 0;
            for (const val of this.generator) {
                if (predicate(val, index++)) {
                    yield val;
                } else {
                    break;
                }
            }
        });
    }

    skipWhile(predicate) {
        return wrap(this, function*() {
            let skipping = true;
            let index = 0;
            for (const val of this.generator) {
                if (!skipping) {
                    yield val;
                } else if (!predicate(val, index++)) {
                    skipping = false;
                    yield val;
                }
            }
        });
    }

    repeatEach(num) {
        return this.flatMap(function*(val) {
            for (let i = 0; i < num; i++) {
                yield val;
            }
        });
    }

    map(mapper) {
        return wrap(this, function*() {
            let index = 0;
            for (const val of this.generator) {
                yield mapper(val, index++);
            }
        });
    }

    flatMap(mapper) {
        return wrap(this, function*() {
            for (const val of this.generator) {
                yield* mapper(val);
            }
        });
    }

    filter(predicate) {
        return wrap(this, function*() {
            let index = 0;
            for (const val of this.generator) {
                if (predicate(val, index++)) {
                    yield val;
                }
            }
        });
    }

    zip(generator) {
        return wrap(this, function*() {
            while (true) {
                const thisVal = this.generator.next();
                const otherVal = generator.next();

                if (thisVal.done || otherVal.done) {
                    break;
                }
                yield [ thisVal.value, otherVal.value ];
            }
        });
    }

    merge(generator) {
        return wrap(this, function*() {
            for (const val of this.generator) {
                yield val;
            }

            let otherGenerator = generator.hasOwnProperty('generator') ? generator.generator : generator;
            for (const val of otherGenerator) {
                yield val;
            }
        });
    }

    combine(generatorFn) {
        return wrap(this, function*() {
            for (const val of this.generator) {
                yield* combiner(val, generatorFn);
            }
        });
    }

    combineFlat(generatorFn) {
        return this.combine(generatorFn).flatten();
    }

    skip(num) {
        return wrap(this, function*() {
            for (let i = 0; i < num; i++) {
                this.generator.next();
            }
            yield* this.generator;
        });
    }

    take(num) {
        return wrap(this, function*() {
            for (let i = 0; i < num; i++) {
                yield this.generator.next().value;
            }
        })
    }

    group(num) {
        return wrap(this, function*() {
            while (true) {
                let arr = new Array(num);
                for (let i = 0; i < num; i++) {
                    arr[i] = this.generator.next().value;
                }
                yield arr;
            }
        })
    }

    flatten() {
        return wrap(this, function*() {
            for (const val of this.generator) {
                yield flatten(val);
            }
        });
    }

    reduce(accumulator, initialValue) {
        let acc = initialValue;
        for (const val of this.generator) {
            acc = accumulator(acc, val);
        }
        return acc;
    }

    count() {
        let counter = 0;
        for (const val of this.generator) {
            counter++;
        }
        return counter;
    }

    groupBy(fn) {
        let obj = {};
        for (const val of this.generator) {
            const key = fn(val);
            const list = obj[key] || [];
            list.push(val);
            obj[key] = list;
        }
        return obj;
    }

    print() {
        return wrap(this, function*() {
            for (const value of this.generator) {
                console.log(value);
                yield value;
            }
        })
    }

    toArray() {
        const arr = [];
        for (const value of this.generator) {
            arr.push(value);
        }
        return arr;
    }

    toSet() {
        const set = new Set();
        for (const value of this.generator) {
            set.add(value);
        }
        return set;
    }
}

module.exports = GeneratorUtils;