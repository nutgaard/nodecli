//https://vera.adeo.no/#/matrix?apps=veilarb*&envs=t4%2Cq5
const open = require('open');
module.exports = function(issue) {
    open(`https://jira.adeo.no/browse/${issue}`);
};