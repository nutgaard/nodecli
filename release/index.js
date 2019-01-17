#!/usr/local/bin/node
const Cli = require('./../utils/cliutils').Cli;

const DiffCommand = require('./diff');
const AnalyzeCommand = require('./analyze');

const cli = new Cli('release', {
    'diff': new DiffCommand(),
    'analyze': new AnalyzeCommand()
});

cli.run();



// release create helseerklaering-process 1.0.24 helseerklaering-ms 1.1.2

function chunk(perChunk) {
    return (acc, el, index) => {
        const chunkIndex = Math.floor(index / perChunk);
        if (!acc[chunkIndex]) {
            acc[chunkIndex] = [];
        }
        acc[chunkIndex].push(el);
        return acc;
    };
}

function process(args) {
    return args
        .reduce(chunk(2), [])
        .map(([ app, version]) => ({ app, version }));
}