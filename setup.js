const log = require('./utils/logging');
const execa = require('execa');
const fs = require('fs');
const path = require('path');
const regedit = require('regedit');

const { domenebrukernavn, domenepassord, path: envPath } = process.env;

if (!domenebrukernavn && !domenepassord) {
    log.error("Legg til miljøvariablene `domenebrukernavn` og `domenepassord`.")
    return;
}

const marksPaths = path.join(process.cwd(), 'marks');
console.log('marksPath', marksPaths);
if (!envPath.includes(marksPaths)) {
    log.error(`Legg til ${marksPaths} to PATH`);
    return;
}


const tmpDir = path.join('c:', 'nodecli-tmp');
const doskeyFile = path.join(process.cwd(), 'doskey', 'doskey.cmd');

if (!fs.existsSync(tmpDir)) {
    log.info('Creating directory for temp-files', tmpDir);
    fs.mkdirSync(tmpDir);
} else {
    log.info('Temp-directory already exists', tmpDir);
}
log.spacer();

log.info('Checking Putty install...');
let hasPutty = false;
try {
    execa.shellSync('where putty').stdout;
    hasPutty = true;
} catch (e) {
    hasPutty = false;
}

if (!hasPutty) {
    log.error('You have to install putty...');
    return;
}
log.spacer();


const regValue = 'AutoRun';
const regkey = 'HKLM\\SOFTWARE\\Microsoft\\Command\ Processor';

regedit.list(regkey, (err, result) => {
    if (err) {
        log.error(err);
        log.spacer();
    } else {
        const values = result[regkey].values;
        if (values[regValue]) {
            log.info('Found preexisting AutoRun for cmd...');
        } else {
            log.info('AutoRun config not found.');
            regedit.putValue({
                [regkey]: {
                    [regValue]: {
                        value: doskeyFile,
                        type: 'REG_EXPAND_SZ'
                    }
                }
            }, (err) => {
                if (err) {
                    log.error(err);
                } else {
                    log.info('Added AutoRun config');
                }
                log.spacer();
            });
        }
    }
});