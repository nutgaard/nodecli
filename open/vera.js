//https://vera.adeo.no/#/matrix?apps=veilarb*&envs=t4%2Cq5
const open = require('open');
module.exports = function(query, envs) {
    if (!query) {
        open('https://vera.adeo.no/');
    } else {
        open(`https://vera.adeo.no/#/matrix?apps=${query}&envs=${envs || ''}`);
    }
};