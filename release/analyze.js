const Command = require('./../utils/cliutils').Command;
const logging = require('./../utils/logging');
const getTaggedRemoteCommits = require('./../utils/gitutils').getTaggedRemoteCommits;



module.exports = class AnalyzeCommand extends Command {
    execute(project, repo, from, to) {
        getTaggedRemoteCommits(project, repo, from, to)
            .then((commits) => {
                commits.forEach((commit) => console.log(JSON.stringify(commit, null, 2)));
            });
    }

    help() {
        return {
            args: '<project> <repo> <fromVersion> <toVersion>',
            msg: 'Finds commits in range'
        };
    }
};