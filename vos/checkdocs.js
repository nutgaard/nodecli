const Command = require('./../utils/cliutils').Command;
const fileUtils = require('./../utils/fileutils');
const logging = require('./../utils/logging');
const fetch = require('node-fetch');
const path = require('path');
const credentials = require('./../utils/credentials');
const fs = require('fs');

async function getSession() {
    return fetch('https://intra.terra.no/insurance-damage/rest/insurance/user');
}

async function login(cookie) {
    const request = {
        method: 'POST',
        headers: {
            accept: 'application/json, text/plain, */*',
            'content-type': 'application/x-www-form-urlencoded',
            cookie: cookie
        },
        body: `username=${credentials.domenebrukernavn}&password=${credentials.domenepassord}`
    };
    return fetch('https://intra.terra.no/insurance-damage/springSecurityLogin', request);
}

async function hentActiveVosProcess(damageId, cookie) {
    return fetch(`https://intra.terra.no/insurance-damage/rest/insurance/activevos/process/damage/${damageId}`, {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "cookie": cookie
        }
    }).then((resp) => {
        if (!resp.ok) {
            throw new Error(resp);
        }
        return resp.json();
    });
}

async function hentSkade(damageId, cookie) {
    return fetch(`https://intra.terra.no/insurance-damage/rest/insurance/damagesearch/${damageId}`, {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "cookie": cookie
        }
    }).then((resp) => {
        if (!resp.ok) {
            console.log('resp', resp); // eslint-disable-line
            throw new Error(resp);
        }
        return resp.json();
    }).then((json) => json.damages[0]);
}

async function hentDokumenter(damage, cookie) {
    return fetch("https://intra.terra.no/insurance-damage/rest/insurance/damage/document", {
        "method": "POST",
        "headers": {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json;charset=UTF-8",
            "cookie": cookie
        },
        "body": JSON.stringify(damage),
    }).then((resp) => {
        if (!resp.ok) {
            console.log('resp', resp); // eslint-disable-line
            throw new Error(resp);
        }
        return resp.json();
    })
        .then((json) => json.documents);
}

function getCookie(resp) {
    return resp.headers._headers['set-cookie'][0];
}

function checkResponseAndReturnCookies(resp, errorMessage) {
    if (!resp.ok) {
        logging.error(errorMessage);
        process.exit(1);
    }
    return getCookie(resp);
}

async function isOk(damageId, cookie) {
    const vosResp = await hentActiveVosProcess(damageId, cookie);
    return {state: vosResp.state};
}

function toContent(list) {
    return list
        .map(({ damageId }) => `https://intra.terra.no/insurance-damage/#/damage/${damageId}`)
        .join('\n');
}

const file = 'lostdoc.txt';

const okFile = path.join('out', 'ok.txt');
const notOkFile = path.join('out', 'not-ok.txt');
const errorFile = path.join('out', 'error.txt');
const ikkeAlleFerdigFile = path.join('out', 'ikke-alle-ferdig.txt');
const alleFerdigFile = path.join('out', 'alle-ferdig.txt');

const ignore = ['https://intra.terra.no/insurance-damage/#/damage/', 'https://intra.terra.no/insurance-damage/#/damage/000000'];
module.exports = class CheckCommand extends Command {
    async execute(...args) {
        if (!fs.existsSync(file)) {
            logging.error(`${file} var ikke i nåværende mappe`);
            return;
        }
        fileUtils.createDir('out');
        fileUtils.remove(okFile);
        fileUtils.remove(notOkFile);
        fileUtils.remove(errorFile);
        fileUtils.remove(ikkeAlleFerdigFile);
        fileUtils.remove(alleFerdigFile);


        const damageIds = fileUtils.getContent(file)
            .split('\n')
            .map((str) => str.trim())
            .filter((str) => !ignore.includes(str))
            .map((str) => {
                const fragments = str.split('/');
                return fragments[fragments.length - 1];
            })
            .filter((str) => str.trim().length > 1);

        logging.info("Starter analyse");
        const sessionRequest = await getSession();
        const sessionCookie = getCookie(sessionRequest);
        const loginRequest = await login(sessionCookie);
        const loginCookie = checkResponseAndReturnCookies(loginRequest, 'Login feilet');
        logging.info("Login ok, starter med uthenting av ActiveVosStatuser");

        let counter = damageIds.length;
        const oppgaveStatus = await Promise.all(damageIds.map((dmg) => new Promise((resolve) => {
            isOk(dmg, loginCookie)
                .then(({state}) => {
                    logging.info(`${counter--} dokumenter igjen`);
                    if (state === 'NONE') {
                        logging.warn(`${dmg} må ses nærmere på`, state);
                    } else if (state === 'FAIL') {
                        logging.error(`${dmg} må ses nærmere på`, state);
                    }
                    resolve(({damageId: dmg, vosState: state}))
                });
        })));

        const okVosStatus = oppgaveStatus.filter(({ vosState }) => vosState === 'OK');
        const failVosStatus = oppgaveStatus.filter(({ vosState }) => vosState === 'FAIL');
        const otherVosStatus = oppgaveStatus.filter(({ vosState }) => vosState !== 'FAIL' && vosState !== 'OK');
        const notOkVosStatus = oppgaveStatus.filter(({vosState}) => vosState !== 'OK');

        fileUtils.writeContent(okFile,
            'Saker med Status OK fra ActiveVos, disse trenger man ikke å gjøre noe med',
            '-------------------------------------------------------------------------',
            toContent(okVosStatus)
        );
        fileUtils.writeContent(notOkFile,
            'Saker med status annet enn OK fra ActiveVos. Videre analyse er nødvendig',
            `Se '${errorFile}' for de med feilede oppgaver og,`,
            `${ikkeAlleFerdigFile} for de som har ubehandlede documenter`,
            '-------------------------------------------------------------------------',
            toContent(notOkVosStatus)
        );
        fileUtils.writeContent(errorFile,
            'Saker med status FAIL fra ActiveVos. Disse trenger manuell hjelp',
            '----------------------------------------------------------------',
            toContent(failVosStatus)
        );
        logging.info(`ActiveVos-filer lagret, status-sjekking ferdig`);
        logging.spacer(2);


        logging.info('Sjekker dokumentstatus');
        counter = otherVosStatus.length;
        const docsStatus = await Promise.all(otherVosStatus
            .filter(({vosState}) => vosState !== 'FAIL')
            .map(async (fault) => {
                let erAlleFerdigBehandled = false;
                try {
                    const dmg = await hentSkade(fault.damageId, loginCookie);
                    const documents = await hentDokumenter(dmg, loginCookie);
                    erAlleFerdigBehandled = documents.every((document) => {
                        const attributes = document.metaData.additionalAttributes.attribute;
                        const terraStatus = attributes.find((attr) => attr.key === 'TERRASTATUSFELT');
                        return (terraStatus && terraStatus.value) === 'Ferdigbehandlet';
                    });
                } catch (e) {
                    logging.error(`Kunne ikke hente dokumentstatus for ${fault.damageId}, sjekk manuelt...`);
                }

                logging.info(`${counter--} dokumenter igjen`);
                if (!erAlleFerdigBehandled) {
                    logging.warn('Status', fault.damageId, erAlleFerdigBehandled);
                }

                return {...fault, erAlleFerdigBehandled};
            }));

        const docAlleFerdig = docsStatus.filter(({erAlleFerdigBehandled}) => erAlleFerdigBehandled);
        const docIkkeAlleFerdig = docsStatus.filter(({erAlleFerdigBehandled}) => !erAlleFerdigBehandled);

        fileUtils.writeContent(alleFerdigFile,
            'Saker med ActiveVos status ulik OK og FAIL, men alle dokumenter er ferdig. Trenger ikke videre behandling',
            '---------------------------------------------------------------------------------------------------------',
            toContent(docAlleFerdig)
        );
        fileUtils.writeContent(ikkeAlleFerdigFile,
            'Saker med ActiveVos status ulik OK og FAIL, men har ubehandlede dokumenter. Trenger videre behandling',
            '-----------------------------------------------------------------------------------------------------',
            toContent(docIkkeAlleFerdig)
        );

        logging.spacer(2);
        logging.table([
            {file: file, lines: fileUtils.getLineCount(file, false)},
            {file: okFile, lines: okVosStatus.length},
            {file: notOkFile, lines: notOkVosStatus.length},
            {file: errorFile, lines: failVosStatus.length},
            {file: alleFerdigFile, lines: docAlleFerdig.length},
            {file: ikkeAlleFerdigFile, lines: docIkkeAlleFerdig.length}
        ]);
    }


    help() {
        return {
            args: '',
            msg: 'NO'
        }
    }
};