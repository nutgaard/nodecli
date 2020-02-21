#!node
const Cli = require('./../utils/cliutils').Cli;

const cli = new Cli('nais', {
    dashboard: require('./dashboard-command'),
    dash: require('./dashboard-command'),
    login: require('./login-command'),
    logincmd: require('./logincmd-command'),
    context: require('./context-command'),
    restart: require('./restart-command'),
    status: require('./status-command')
});

cli.run();
