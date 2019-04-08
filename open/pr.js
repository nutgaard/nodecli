const Command = require('./../utils/cliutils').Command;
const open = require('open');
const execa = require('execa');
const getPRUrl = require('./../utils/gitutils').getPRUrl;
const hasLocalChangesUtils = require('./../utils/gitutils').hasLocalChanges;
const getCurrentBranch = require('./../utils/gitutils').getCurrentBranch;
const getRemoteBranches = require('./../utils/gitutils').getRemoteBranches;
const logging = require('./../utils/logging');

function exec(str) {
    console.log('[EXEC]', str);
    return execa.shellSync(str)
        .stdout
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
}

function hasLocalChanges() {
    const changes = hasLocalChangesUtils();

    if (changes !== false) {
        const l = logging.error('You got local changes in this repository...');
        logging.line(l);
        logging.pure(`Diff\t\t${changes.diff}`);
        logging.pure(`Diffcache\t${changes.diffcache}`);
        logging.pure(`Untracked\t${changes.untracked}`);
        logging.line(l);
        logging.spacer();

        return true;
    }
    return false;
}

function getBranchConfig() {
    const current = getCurrentBranch();
    const isCurrentRemote = getRemoteBranches().includes(current);
    const currentRemote = isCurrentRemote ? `remotes/origin/${current}` : undefined;
    const hasDevelopBranch = getRemoteBranches().includes('develop');

    return {
        current,
        currentRemote,
        isCurrentRemote,
        hasDevelopBranch
    };
}

module.exports = class PrCommand extends Command {
    execute() {
        if (hasLocalChanges()) {
            return;
        }

        const branchconfig = getBranchConfig();
        if (!branchconfig.isCurrentRemote) {
            logging.info('Branch not found on remote, pushing...');
            exec(`git push -u origin ${branchconfig.current}`);
        }

        getPRUrl(branchconfig.current, branchconfig.hasDevelopBranch ? 'develop' : 'master')
            .then(open);
    }

    help() {
        return {
            args: '',
            msg: 'Opens PR view for current branch.'
        }
    }
};
