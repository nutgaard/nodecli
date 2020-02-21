const path = require('path');
const regedit = require('regedit');
const log = require('./utils/logging');

const regValue = 'AutoRun';
const regkey = 'HKLM\\SOFTWARE\\Microsoft\\Command\ Processor';
const doskeyFile = path.join(process.cwd(), 'doskey', 'doskey.cmd');

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