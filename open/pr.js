// http://stash.devillo.no/plugins/servlet/search?q=veilarbportefolje
const open = require('open');
const execa = require('execa');
const getPRUrl = require('./../utils/gitutils').getPRUrl;
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
    const untracked = exec('git ls-files --exclude-standard --other').length;

    const changes = max(diff, diffcache, untracked);
    if (changes > 0) {
        const l = logging.error('You got local changes in this repository...');
        logging.line(l);
        logging.pure(`Diff\t\t${diff}`);
        logging.pure(`Diffcache\t${diffcache}`);
        logging.pure(`Untracked\t${untracked}`);
        logging.line(l);
        logging.spacer();
    }
    return false;
}

function getBranchConfig() {
    const branchlist = exec('git branch -a');

    const current = branchlist
        .find((branch) => branch.startsWith('*'))
        .slice(2);

    const currentRemote = branchlist
        .find((branch) => branch.includes(`remotes/origin/${current}`));
    const isCurrentRemote = !!currentRemote;

    return {
        current,
        currentRemote,
        isCurrentRemote
    };
}

function stashUrl(appnavn, fromBranch) {
    const source = encodeURIComponent(fromBranch);
    return `http://stash.devillo.no/projects/FO/repos/${appnavn}/pull-requests?create&sourceBranch=refs%2Fheads%2F${source}&targetBranch=refs%2Fheads%2Fmaster`
}
function githubUrl(appnavn, fromBranch) {
    return `https://github.com/navikt/${appnavn}/compare/${fromBranch}?expand=1`;
}

module.exports = function () {
    if (hasLocalChanges()) {
        return;
    }

    const branchconfig = getBranchConfig();
    if (!branchconfig.isCurrentRemote) {
        logging.info('Branch not found on remote, pushing...');
        exec(`git push -u origin ${branchconfig.current}`);
    }

    open(getPRUrl(branchconfig.current));
};