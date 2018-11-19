const Command = require('./../utils/cliutils').Command;
const logging = require('./../utils/logging');
const fileUtils = require('./../utils/fileutils');
const confluence = require('./../utils/confluence');

const fs = require('fs');
const path = require('path');

const pages = [
    {query: '<dom:claimId></dom:claimId>', pageId: '89228670'}, // claimId BLANK
    {query: '<dom:claimId>000000</dom:claimId>', pageId: '89228666'}, // claimId 000000
    {query: '<dom:claimId>000000.0</dom:claimId>', pageId: '89228668'} // claimId 000000.0
];

const confluencePages = [
    {pageId: '88967274', file: path.join('out', 'error.txt')}, // Tjenestefeil ved send til arbeidslisten,
    {pageId: '88967272', file: path.join('out', 'ikke-alle-ferdig.txt')}, // Ingen oppgave på skaden i arbeidslisten
    {pageId: '88967276', file: 'dupproc.txt'} // Dupliserte processer
];

const file = 'loginput.txt';

module.exports = class LostdocUpdateCommand extends Command {
    execute(issue) {
        if (!fs.existsSync(file)) {
            logging.error(`${file} not found in current directory`);
            return;
        }

        const errors = pages.map(({query, pageId}) => {
            let matches = fileUtils
                .getContentReader(file)
                .skipWhile((line) => line !== query)
                .takeWhile((line, index) => index < 3 || line.startsWith('<dom1:documentId'))
                .toArray()
                .join('\n');

            if (matches.length === 0) {
                matches = 'Ingen';
            }

            return {query, pageId, matches};
        });

        errors.forEach(async ({pageId, matches}) => {
            const confluenceData = await confluence.getPage(pageId);
            await confluence.upatePage(pageId, confluenceData.space.key, confluenceData.title, confluence.content.wiki(matches));
        });

        confluencePages.forEach(async ({pageId, file}) => {
            const confluenceData = await confluence.getPage(pageId);
            const content = fileUtils.getContent(file).split('\n').join('\n\n');

            await confluence.upatePage(pageId, confluenceData.space.key, confluenceData.title, confluence.content.wiki(content));
        });
    }

    help() {
        return {
            args: '',
            msg: 'Reads lostdoc.txt and updates confluence-pages'
        };
    }
}