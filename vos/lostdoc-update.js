const Command = require('./../utils/cliutils').Command;
const logging = require('./../utils/logging');
const fileUtils = require('./../utils/fileutils');
const confluence = require('./../utils/confluence');

const fs = require('fs');

const confluenceSpaceId = 'PRFFE';
const pages = [
    { query: '<dom:claimId></dom:claimId>', title: 'claimId BLANK' },
    { query: '<dom:claimId>000000</dom:claimId>', title: 'claimId 000000' },
    { query: '<dom:claimId>000000.0</dom:claimId>', title: 'claimId 000000.0' },
];

const file = 'loginput.txt';

module.exports = class JiraCommand extends Command {
    execute(issue) {
        if (!fs.existsSync(file)) {
            logging.error(`${file} not found in current directory`);
            return;
        }

        const errors = pages.map(({ query, title }) => {
            let matches = fileUtils
                .getContentReader(file)
                .skipWhile((line) => line !== query)
                .takeWhile((line, index) => index < 3 || line.startsWith('<dom1:documentId'))
                .toArray()
                .join('\n');

            if (matches.length === 0) {
                matches = 'Ingen';
            }

            return { query, title, matches };
        });

        errors.forEach(async ({ title, matches }) => {
            const response = await confluence.findPage(confluenceSpaceId, title);
            if (response.results.length !== 1) {
                logging.error(`Could not find confluence page with title ${title}`);
                process.exit(1);
            }
            const pageid = response.results[0].id;
            await confluence.upatePage(pageid, confluenceSpaceId, title, confluence.content.wiki(matches));
        });


    }

    help() {
        return {
            args: '',
            msg: 'Reads lostdoc.txt and updates confluence-pages'
        };
    }
}