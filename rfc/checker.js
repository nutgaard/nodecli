const Logging = require('./../utils/logging');
const LocalStorage = require('./../utils/localstorage');
const notifier = require('node-notifier');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const credentials = require('./../utils/credentials');
const path = require('path');
const fs = require('fs');
const logFile = path.resolve('/nodecli-tmp', `checkerdaemon.log`);
const logStream = openLog(logFile);


function openLog(logfile) {
    return fs.createWriteStream(logfile, {
        flags: 'a', encoding: 'utf8', mode: 644
    });
}

function log(msg) {
    console.log(msg); // eslint-disable-line
    logStream.write(msg + '\n');
}

global.logLevel = Logging.logLevels.DEBUG;

// setInterval(() => {}, 1 << 30); // Keep-alive

const data = new LocalStorage('RFC-Checker');

function formData(obj) {
    return Object.keys(obj)
        .map((key) => `${key}=${encodeURIComponent(obj[key])}`)
        .join('&');
}

async function getSession() {
    return fetch('https://dashboard.intra.eika.no/infrastruktur-change-management-intraweb/')
}

async function login(cookie) {
    const request = {
        method: 'POST',
        headers: {
            accept: 'application/json, text/plain, */*',
            'content-type': 'application/x-www-form-urlencoded',
            cookie: cookie
        },
        redirect: 'manual',
        body: formData({
            path: '',
            ekajwtVersion: '',
            username: credentials.domenebrukernavn,
            password: credentials.domenepassord,
            login: 'Logg inn'
        })
    };
    return fetch('https://dashboard.intra.eika.no/felles-user-portal-intraweb/webresources/api/loginform', request);
}

async function getApps(cookie) {
    const apps = [];
    const addApp = (name, artifactId, groupId) => apps.push({ name, artifactId, groupId });
    return fetch(`https://dashboard.intra.eika.no/infrastruktur-change-management-intraweb/rest/resource/`, {
        headers: {
            cookie
        }
    })
        .then(resp => resp.text())
        .then(html => {
            const $ = cheerio.load(html);
            $('.dropdown-menu li a')
                .each((i, el) => {
                    new Function('addApp', $(el).attr('onclick'))(addApp);
                });
            log(`Found ${apps.length} app-definitions`);
            return apps;
        });
}

async function checkStatus({ groupId, artifactId }, cookie) {
    return fetch(`https://dashboard.intra.eika.no/infrastruktur-change-management-intraweb/rest/resource/deploymentinfo/${groupId}/${artifactId}`, {
        headers: {
            cookie
        }
    }).then(resp => resp.json());
}

function getCookie(resp) {
    return resp.headers._headers['set-cookie'][0];
}

function checkResponseAndReturnCookies(resp, errorMessage) {
    if (!resp.ok && resp.status !== 307) {
        Logging.error(errorMessage);
        process.exit(1);
    }
    return getCookie(resp);
}

async function check() {
    const appsToCheck = data.get('apps') || [];
    if (appsToCheck.length === 0) {
        log('No apps to check, halting for now...');
        return;
    }

    const loginRequest = await login();
    const loginCookie = checkResponseAndReturnCookies(loginRequest, 'Login feilet');
    const applications = await getApps(loginCookie);

    appsToCheck.forEach(async (app) => {
        log(`Checking status for ${app}`);
        let appDefinition = applications.filter(({ artifactId }) => artifactId.includes(app));
        if (appDefinition.length === 1) {
            appDefinition = appDefinition[0];
        }
        const appStatus = await checkStatus(appDefinition, loginCookie);
        const qaStatus = appStatus.deployments.find(({ env }) => env === 'qa');
        const prodStatus = appStatus.deployments.find(({ env }) => env === 'prod');

        if (qaStatus.version !== prodStatus.version) {
            notifier.notify({
                title: 'RFC Klar til utfylling',
                message: appDefinition.artifactId,
                wait: true
            });
        }
    });
}

setInterval(check, 60000);
check();