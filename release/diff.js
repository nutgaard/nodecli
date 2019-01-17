const Command = require('./../utils/cliutils').Command;
const logging = require('./../utils/logging');
const getRemoteCommits = require('./../utils/gitutils').getRemoteCommits;


module.exports = class DiffCommand extends Command {
    execute(project, repo, from, to) {
        getRemoteCommits(project, repo, from, to)
            .then((commits) => logging.table(commits, {
                message(msg) {
                    const concatMsg = msg
                        .split("\n")
                        .join(" - ");
                    const max = Math.floor(process.stdout.columns / 2);
                    if (concatMsg.length > max) {
                        return concatMsg.slice(0, max) + "...";
                    }
                    return msg;
                }
            }));
    }

    help() {
        return {
            args: '<project> <repo> <fromVersion> <toVersion>',
            msg: 'Finds commits in range'
        };
    }
};