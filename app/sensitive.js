const Command = require('./../utils/cliutils').Command;
const GitUtils = require('./../utils/gitutils');
const Log = require('./../utils/logging');


const grepSize = 1;
class LoginCommand extends Command {
    execute(environment) {
        Log.info("Starting search");
        const revlist = GitUtils.getRevList();
        Log.info(`Found ${revlist.length} commits`);

        // let init = 0;
        for (let init = 0; init < 10; init++) {
            const commits = revlist.slice(init, init + grepSize);
            const matches = GitUtils.grep("\\d{11,13}", commits);
            Log.info(`Searching commit ${init}-${init+grepSize}, found ${matches.length} entries`);
        }
        // while (init + grepSize < revlist) {
        // }

    }

    help() {
        return {
            args: '',
            msg: 'Genereates list of sensitive data in repo'
        };
    }
}

module.exports = new LoginCommand();