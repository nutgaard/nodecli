const fs = require('fs');
const path = require('path');
const Logging = require('./../utils/logging');
const Command = require('./../utils/cliutils').Command;
const Utils = require('./utils');

class UniqueCommand extends Command {
    help() {
        return {
            args: '[file]',
            msg: 'show unique direct dependencies'
        };
    }


    execute(filename = 'tree.txt') {
        const file = path.join(process.cwd(), filename);
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        const dependencies = Utils
            .cleanup(lines)
            .map((line) => {
                const [groupId, artifactId, type, version, scope] = line.split(':');
                return {
                    groupId,
                    artifactId,
                    type,
                    version,
                    scope,
                    artifact: `${groupId}:${artifactId}`
                }
            })
            .map(({artifact}) => artifact);

        Array.from(new Set(dependencies))
            .forEach((line) => Logging.pure(line));
    }
}

module.exports = new UniqueCommand();