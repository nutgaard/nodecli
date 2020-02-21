#!node
const Cli = require('./../utils/cliutils').Cli;
const nodecliConfig = require('./../utils/nodecli-config').default;

function getInternalCommands() {
    if (nodecliConfig.isInternal()) {
        return {
            lift: require('./lift-command'),
            redeploy: require('./redeploy-command')
        };
    }
    return {};
}

const cli = new Cli('vera', {
    ...(getInternalCommands()),
    diff: require('./diff-command'),
    sjekk: require('./sjekk-command'),
});

cli.run();
