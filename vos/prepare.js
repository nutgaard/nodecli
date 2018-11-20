const Command = require('./../utils/cliutils').Command;
const fileUtils = require('./../utils/fileutils');
const logging = require('./../utils/logging');

const input = 'loginput.txt';
const lostdocsFile = 'lostdoc.txt';
const dupprocFile = 'dupproc.txt';

const xmlRegex = /^<dom:claimId>(\d*(?:\.\d+)?)/;
const dupRegex = /^DUPLICATE:(\d+(?:\.\d+)?)/;

function extractDamageId(line) {
    if (line.includes('DUPLICATE')) {
        return dupRegex.exec(line)[1];
    } else {
        return xmlRegex.exec(line)[1];
    }
}

module.exports = class PrepareCommand extends Command {
    async execute() {
        logging.info('Rydder i filene');
        fileUtils.remove(lostdocsFile);
        fileUtils.remove(dupprocFile);
        logging.info('Ryddin ferdig');
        logging.spacer(2);

        logging.info("Henter ut tapte dokumenter");
        const lostDocs = fileUtils
            .getContentReader(input)
            .filter((line) => line.includes('<dom:claimId>')) // <dom:claimId>5879409.1</dom:claimId>
            .map((line) => {
                const damageId = extractDamageId(line);
                return `https://intra.terra.no/insurance-damage/#/damage/${damageId}`;
            })
            .toArray();
        fileUtils.writeContent(lostdocsFile, ...lostDocs);

        logging.info('Henter ut dupliserte prosesser');
        const dupproc = fileUtils
            .getContentReader(input)
            .filter((line) => line.includes('DUPLICATE:')) // DUPLICATE:2539787.9, Pid:88749558
            .map((line) => {
                const damageId = extractDamageId(line);
                return `https://intra.terra.no/insurance-damage/#/damage/${damageId}`;
            })
            .toArray();
        fileUtils.writeContent(dupprocFile,
            'Saker med duplikater i ActiveVos. Denne filen blir bare oppdatert ved kjøring av java-analysen',
            '----------------------------------------------------------------------------------------------',
            ...dupproc);

        logging.info("Klargjørings-script ferdig. Du kan nå kjøre `vos check` og `vos update`.");
    }


    help() {
        return {
            args: '',
            msg: 'NO'
        }
    }
};