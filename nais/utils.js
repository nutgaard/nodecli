const execa = require('execa');

function simpleExec(str) {
    return execa.shellSync(str)
        .stdout
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
}

function setContext(context) {
    if (context) {
        return simpleExec(`kubectl config use-context ${context}`);
    }
    return [];
}

function getContext() {
    return simpleExec(`kubectl config current-context`)[0];
}

function getPodsPureOutput(namespace = 'default') {
    const output = simpleExec(`kubectl get pods -n${namespace}`);
    const header = output[0];
    const data = output.slice(1);

    return { header, data };
}

function getPods(namespace = 'default') {
    return getPodsPureOutput(namespace)
        .data
        .map((line) => {
            const [name, ready, status, restarts, age] = line.split(' ').filter(attr => attr);
            return {
                name, ready, status, restarts, age
            };
        });
}

function deletePod(namespace, name) {
    return simpleExec(`kubectl delete pods -n${namespace} ${name}`);
}

function parseInput(args) {
    return args
        .map((value, index, list) => {
            if (value.endsWith('-fss') || value.endsWith('-sbs')) {
                return { context: value }
            } else if (index === list.length - 1) {
                return { grep: value }
            } else {
                return { namespace: value }
            }
        })
        .reduce((acc, value) => ({ ...acc, ...value}), {});
}

function login(name) {
    const cmd = execa('kubectl', `exec ${name} -i -t -- bash -il`.split(' '));
    cmd.stdout.pipe(process.stdout);
    process.stdin.pipe(cmd.stdin);
    cmd.catch((error) => console.log('error', error));
}

module.exports = {
    setContext,
    getContext,
    getPods,
    getPodsPureOutput,
    login,
    parseInput,
    deletePod
};