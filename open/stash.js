// http://stash.devillo.no/plugins/servlet/search?q=veilarbportefolje
const open = require('open');
const execa = require('execa');


module.exports = function(query) {
    if (!query || query === '.') {
        const regex = /origin.*?([\w-]+)\/([\w-]+)\.git/g;
        const message = execa.shellSync('git remote -v');
        const match = regex.exec(message.stdout);
        const project = match[1];
        const repo = match[2];

        open (`http://stash.devillo.no/projects/${project}/repos/${repo}/browse`);
    } else {
        open(`http://stash.devillo.no/plugins/servlet/search?q=${query}`);
    }
};