//https://fasit.adeo.no/wicket/bookmarkable/no.nav.aura.envconfig.gui.applicationinstance.ApplicationInstancePage?3&appinst=2247222
const open = require('open');
module.exports = function(query) {
    open(`https://fasit.adeo.no/search?q=${query}`);
};