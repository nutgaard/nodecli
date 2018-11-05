const Command = require('./../utils/cliutils').Command;
const Log = require('./../utils/logging');
const ChefUtils = require('./utils');
const Science = require('./../utils/science');
const path = require('path');

function joinResult(results) {
    return results
        .reduce((a, b) => a.concat(b))
        .filter((res) => !!res);
}

module.exports = class SearchCommand extends Command {
    execute(query) {
        const files = ChefUtils.getQAArtifactFiles();

        Promise.all(files.map(Science.test(ChefUtils.search, ChefUtils.search2)(query)))
            .then(joinResult)
            .then((result) => {
                Log.pure(`Found ${Object.keys(result).length} matches`);
                Log.table(result, { file(name) { return path.basename(name); } });
                Log.spacer(2);
            });
    }

    help() {
        return {
            args: '<query>',
            msg: "Searches for an artifact/appname in all chef-configs"
        };
    }
};
//
// console.time('read');
// const queryRegex = new RegExp(`\\s[":,]*?([^\\s":,]*akp[^\\s":,]*)[":,]*?\\s`);
// const contentList = ChefUtils.getQAArtifactFiles().map((file) => FileUtils.getContent(file));
// console.timeEnd('read');
//
// console.time('search2');
// const data = contentList.map((content) => !!content.match(queryRegex));
// console.timeEnd('search2');
//
// console.time('search');
// const data2 = contentList.map((content) => JsonUtils.searchJson(content, 'akp'));
// console.timeEnd('search');
//
// console.log('files', JSON.stringify(contentList).length / 1024 / 1024, 'mb'); // eslint-disable-line

// console.log('data', data); // eslint-disable-line
// console.log('data2', data2); // eslint-disable-line