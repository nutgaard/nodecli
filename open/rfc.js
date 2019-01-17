const Command = require('./../utils/cliutils').Command;
const open = require('open');


module.exports = class RFCCommand extends Command {
    execute(rfc = '') {
        open(`https://dashboard.intra.eika.no/infrastruktur-change-management-intraweb/rest/resource/${rfc}`);
    }

    help() {
        return {
            args: '<rfc-key>',
            msg: 'Opens RFC'
        };
    }
}