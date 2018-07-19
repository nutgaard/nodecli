#!node
const fs = require('fs');
const path = require('path');
const log = require('./../utils/logging');

const file = path.join(process.cwd(), 'package.json');

if (!fs.existsSync(file)) {
    log.error("No package.json found");
    return;
}


const pkg = JSON.parse(fs.readFileSync(file, 'utf-8'));
log.spacer();
const scripts = pkg.scripts || {};
Object.keys(scripts)
    .map((cmd) => {
        const val = scripts[cmd];
        log.pure(`  ${cmd}`);
        log.pure(`    ${val}`);
    });
