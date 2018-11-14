const fetch = require('./fetch');

function getAllReleases(project) {
    return fetch(`https://jirasd.intra.eika.no/rest/api/2/project/${project}/versions`)
        .then((resp) => resp.json());
}

function findRelease(project, query) {
    return getAllReleases(project)
        .then((json) => {
            return json.find((release) => {
                return release.id === query || release.name.toLowerCase().startsWith(query.toLowerCase())
            })
        });
}

function findAllReleases(project, query) {
    return getAllReleases(project)
        .then((json) => {
            return json.filter((release) => {
                return release.id === query || release.name.toLowerCase().startsWith(query.toLowerCase())
            })
        });
}

function findIssues(query) {
    return fetch(`https://jirasd.intra.eika.no/rest/api/2/search?jql=${encodeURIComponent(query)}`)
        .then((resp) => resp.json());
}

module.exports = {
    getAllReleases,
    findRelease,
    findAllReleases,
    findIssues
};