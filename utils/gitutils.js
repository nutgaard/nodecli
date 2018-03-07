const path = require('path');
const execa = require('execa');

function getGitRoot() {
    return execa.shellSync('git rev-parse --show-toplevel').stdout
}

function getOrigin() {
    const remoteOrigin = execa.shellSync('git remote -v').stdout
        .split('\n')
        .find((line) => line.startsWith('origin') && line.endsWith('(push)'));

    if (!remoteOrigin) {
        throw new Error('Could not find remote origin...');
    }

    const isGithub = remoteOrigin.includes('github.com');
    const isStash = remoteOrigin.includes('stash.devillo.no');

    const remoteFragments = remoteOrigin.split(/[/.]/);
    const repo = remoteFragments[remoteFragments.length - 2];

    if (isGithub) {
        return { isGithub, isStash, repo };
    } else if (isStash) {
        const project = remoteFragments[remoteFragments.length - 3];
        return { isGithub, isStash, repo, project };
    }
}

function getPRUrl(fromBranch) {
    const origin = getOrigin();

    if (origin.isGithub) {
        return `https://github.com/navikt/${origin.repo}/compare/${fromBranch}?expand=1`;
    } else {
        return `http://stash.devillo.no/projects/${origin.project}/repos/${origin.repo}/pull-requests?create&sourceBranch=refs%2Fheads%2F${fromBranch}&targetBranch=refs%2Fheads%2Fmaster`
    }
}

function getAppname() {
    return path.basename(getGitRoot());
}

module.exports = {
    getOrigin,
    getGitRoot,
    getAppname,
    getPRUrl
};