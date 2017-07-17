const fs = require('fs');
const path = require('path');
const http = require('http');
const notifier = require('node-notifier');
const logFile = path.resolve('/nodecli-tmp', `deploydaemon.log`);
const logStream = openLog(logFile);
const open = require('open');
const jiraUrl = 'https://jira.adeo.no';

notifier.on('click', (obj, opt) => {
    log('click', opt.jiraKey);
    open(jiraUrl + '/browse/' + opt.jiraKey);
});

function openLog(logfile) {
    return fs.createWriteStream(logfile, {
        flags: 'a', encoding: 'utf8', mode: 644
    });
}

function log(msg) {
    console.log(msg);
    logStream.write(msg + '\n');
}

const jiraMemory = { '6935562131854758': 'DEPLOY-1231' };

log('Starting...');
function isOkUrl(url) {
    return url.endsWith('proceedEmpty');
}
function getJiraKey(url) {
    const reg = /(\d+)\/(DEPLOY-\d+)$/;
    const res = reg.exec(url);
    if (res) {
        return { uid: res[1], key: res[2] };
    }
    return null;
}
function getUid(url) {
    const reg = /^\/(\d+)/;
    const res = reg.exec(url);
    if (res) {
        return res[1];
    }
    return null;
}

var server = http.createServer(function (req, res) {
    log(`Request ${req.connection.remoteAddress}${req.url}`);
    if (req.url === '/favicon.ico') {
        res.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        res.end('OK');
        return;
    }

    if (req.method === 'PUT') {
        const jiraKey = getJiraKey(req.url);
        if (jiraKey) {
            jiraMemory[jiraKey.uid] = jiraKey.key;
            res.writeHead(200, { 'Content-Type': 'text-plain' });
            res.end('Ok');
            return;
        } else {
            log('Error: could not parse ' + req.url);
            res.writeHead(500, { 'Content-Type': 'text-plain' });
            res.end('Error');
            return;
        }
    }


    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end('OK');

    const ok = isOkUrl(req.url);
    const uid = getUid(req.url);
    const jiraKey = jiraMemory[uid];

    if (jiraKey) {
        delete jiraMemory[uid];
    }

    log(`status ${ok}, ${uid}, ${jiraKey}, ${JSON.stringify(jiraMemory)}`);
    const msg = `${ok ? 'OK' : 'ERROR'}\n${jiraKey ? '' : 'Fant ikke jiraKey i Memory'}`;

    notifier.notify({
        title: jiraKey,
        message: msg,
        sound: !ok,
        jiraKey: jiraKey,
        wait: true,
        icon: path.join(__dirname, 'jira.ico')
    });
}).listen(31337);

log('Started.');

process.on('uncaughtException', function (err) {
    log(err.stack);
});

process.once('SIGTERM', function () {
    log('Stopping...');

    server.on('close', function () {
        log('Stopped.');

        logStream.on('close', function () {
            process.exit(0);
        }).end();

    }).close();
});