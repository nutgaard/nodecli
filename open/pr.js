// http://stash.devillo.no/plugins/servlet/search?q=veilarbportefolje
const open = require('open');
const execa = require('execa');
const fetch = require('node-fetch');
const inquirer = require('inquirer');
const logging = require('./../utils/logging');

function exec(str) {
    return execa.shellSync(str)
        .stdout
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
}

function max(...args) {
    return args
        .reduce((a, b) => Math.max(a, b), Number.MIN_SAFE_INTEGER);
}

function hasLocalChanges() {
    const diff = exec('git diff --name-only').length;
    const diffcache = exec('git diff --cached --name-only').length;
    const unpushed = exec('git cherry -v').length;
    const untracked = exec('git ls-files --exclude-standard --other').length;

    const changes = max(diff, diffcache, unpushed, untracked);
    if (changes > 0) {
        const l = logging.error('You got local changes in this repository...');
        logging.line(l);
        logging.pure(`Diff\t\t${diff}`);
        logging.pure(`Diffcache\t${diffcache}`);
        logging.pure(`Unpushed\t${unpushed}`);
        logging.pure(`Untracked\t${untracked}`);
        logging.line(l);
        logging.spacer();
    }
    return false;
}

function getBranchConfig() {
    const branchlist = exec('git branch -a');
    const remotes = exec('git remote -v');

    const isStash = remotes
        .some((remote) => remote.startsWith('origin') && remote.includes('stash.devillo.no'));

    const isGithub = remotes
        .some((remote) => remote.startsWith('origin') && remote.includes('github.com'));


    const current = branchlist
        .find((branch) => branch.startsWith('*'))
        .slice(2);

    const currentRemote = branchlist
        .find((branch) => branch.includes(`remotes/origin/${current}`));
    const isCurrentRemote = !!currentRemote;

    return {
        current,
        currentRemote,
        isCurrentRemote,
        isStash,
        isGithub
    };
}

function stashUrl(fromBranch) {
    const source = encodeURIComponent(fromBranch);
    return `http://stash.devillo.no/projects/FO/repos/veilarbaktivitet/pull-requests?create&sourceBranch=refs%2Fheads%2F${source}&targetBranch=refs%2Fheads%2Fmaster`
}
function githubUrl(fromBranch) {
    return `https://github.com/navikt/veilarbportefoljeflatefs/compare/${fromBranch}?expand=1`;
}

module.exports = function () {
    if (hasLocalChanges()) {
        return;
    }

    const branchconfig = getBranchConfig();
    if (!branchconfig.isCurrentRemote) {
        logging.error('Branch not found on remote');
        return;
    } else if (branchconfig.isGithub) {
        open(githubUrl(branchconfig.current));
    } else if (branchconfig.isStash) {
        open(stashUrl(branchconfig.current));
    }
};