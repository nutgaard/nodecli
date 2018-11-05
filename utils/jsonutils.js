
function visit(json, visitors) {
    let nodes = [json];
    while (nodes.length > 0) {
        const current = nodes.pop();
        if (Array.isArray(current)) {
            nodes = nodes.concat(current);
        } else if (typeof current !== 'object') {
            visitors.values([current]);
        } else if (current === null || current === undefined) {
        } else {
            visitors.keys(Object.keys(current));
            nodes = nodes.concat(Object.keys(current).map((key) => current[key]));
        }
    }
}

function flatten(json) {
    let keysList = [];
    let valuesList = [];

    const visitors = {
        keys(keys) {
            keysList = keysList.concat(keys);
        },
        values(values) {
            valuesList = valuesList.concat(values.filter((value) => typeof value !== 'object'))
        }
    };

    visit(json, visitors);

    return {keys: keysList, values: valuesList};
}

function compile(query) {
    if (query.test) {
        return query;
    }
    return new RegExp(query.toString());
}
function toJson(maybeJson) {
    if (typeof maybeJson === 'string') {
        return JSON.parse(maybeJson);
    }
    return maybeJson;
}

function searchJsonKeys(json, query) {
    const {keys} = flatten(toJson(json));
    const regex = compile(query);

    return keys
        .filter((key) => regex.test(key));
}

function searchJsonValues(json, query) {
    const {values} = flatten(toJson(json));
    const regex = compile(query);

    return values
        .filter((value) => regex.test(value));
}

function searchJson(json, query) {
    const {keys, values} = flatten(toJson(json));
    const regex = compile(query);

    return keys
        .concat(values)
        .filter((value) => regex.test(value));
}

module.exports = {
    searchJson,
    searchJsonKeys,
    searchJsonValues
};