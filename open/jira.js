const Command = require('./../utils/cliutils').Command;
const open = require('open');


module.exports = class JiraCommand extends Command {
    execute(issue) {
        open(`https://jira.intra.eika.no/browse/${issue}`);
    }

    help() {
        return {
            args: '<issueKey>',
            msg: 'Jira-issue'
        };
    }
}