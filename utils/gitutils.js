const path = require('path');
const execa = require('execa');
const time = require('time-ago');
const fetchJson = require('./fetch').fetchJson;

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

function getGitRoot() {
    try {
        return execa.shellSync('git rev-parse --show-toplevel').stdout;
    } catch (e) {
        return false;
    }
}

function getOrigin() {
    const remoteOrigin = exec('git remote -v')
        .find((line) => line.startsWith('origin') && line.endsWith('(push)'));

    if (!remoteOrigin) {
        throw new Error('Could not find remote origin...');
    }

    const isGithub = remoteOrigin.includes('github.com');
    const isStash = remoteOrigin.includes('intra.eika.no');

    const remoteFragments = remoteOrigin.split(/[/.]/);
    const repo = remoteFragments[remoteFragments.length - 2];
    const project = remoteFragments[remoteFragments.length - 3];

    return { isGithub, isStash, repo, project };
}

function getPRUrl(fromBranch) {
    const origin = getOrigin();

    if (origin.isGithub) {
        return Promise.resolve(`https://github.com/navikt/${origin.repo}/compare/${fromBranch}?expand=1`);
    } else {
        return fetchJson(`https://git.intra.eika.no/rest/api/1.0/projects/${origin.project}/repos/${origin.repo}/pull-requests`)
            .then((json) => {
                const openPr = json.values
                    .find((pr) => pr.fromRef.displayId === fromBranch);

                if (openPr) {
                    return `https://git.intra.eika.no/projects/${origin.project}/repos/${origin.repo}/pull-requests/${openPr.id}/overview`;
                } else {
                    return `https://git.intra.eika.no/projects/${origin.project}/repos/${origin.repo}/pull-requests?create&sourceBranch=refs%2Fheads%2F${fromBranch}&targetBranch=refs%2Fheads%2Fdevelop`;
                }
            });
    }
}

function hasLocalChanges() {
    const diff = exec('git diff --name-only').length;
    const diffcache = exec('git diff --cached --name-only').length;
    const untracked = exec('git ls-files --exclude-standard --other').length;

    const changes = max(diff, diffcache, untracked);
    if (changes > 0) {
        return { diff, diffcache, untracked };
    }
    return false;
}

function getAppname() {
    return path.basename(getGitRoot());
}

function getCurrentBranch() {
    return exec('git rev-parse --abbrev-ref HEAD')[0];
}

function getRemoteBranches() {
    const lsRemote = exec('git ls-remote --heads origin');
    return lsRemote
        .map((remoteHead) => remoteHead.replace(/^.+?refs\/heads\//, ''))
}

function getLastCommitMessages(lastN = 10) {
    return exec(`git log -${lastN} --oneline`)
        .map((commit) => commit.slice(8));
}

const jiraTagPattern = /^\[?\w+(?:-\d+)\]?/;
function processCommits(json) {
    return json.values.map((commit) => ({
        hash: commit.displayId,
        author: commit.author.displayName,
        commited: time.ago(commit.authorTimestamp),
        message: commit.message,
        jiratag: jiraTagPattern.test(commit.message) ? jiraTagPattern.exec(commit.message)[0].replace(/\[|\]/g, '') : null
    }));
}

function getRemoteCommits(project, repo, from, to) {
    return fetchJson(`https://git.intra.eika.no/rest/api/1.0/projects/${project}/repos/${repo}/commits?since=v${from}&until=v${to}&limit=200&withCounts=true`)
        .then(processCommits);
}

function getTaggedRemoteCommits(project, repo, from, to) {
    return getRemoteCommits(project, repo, from, to)
        .then((commits) => commits.filter(({ jiratag }) => jiratag));
}

module.exports = {
    hasLocalChanges,
    getOrigin,
    getGitRoot,
    getAppname,
    getPRUrl,
    getCurrentBranch,
    getRemoteBranches,
    getLastCommitMessages,
    getRemoteCommits,
    getTaggedRemoteCommits
};
