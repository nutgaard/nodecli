#!node
const Utils = require('./utils');

const files = Utils.getFiles(process.cwd(), null);
const lines = files.map((file) => Utils.getLineCount(file).then((lines) => ({ file, lines })));


Promise.all(lines)
    .then((lineCounts) => {
        const grouped = lineCounts
            .reduce((acc, el) => {
                const group = acc[el.lines] || { count: 0, files: [] };
                group.count = group.count + 1;
                group.files.push(el.file);
                acc[el.lines] = group;
                return acc;
            }, {});

        console.log(JSON.stringify(grouped, null, 2));
    }).catch((err) => console.log('error', err));
