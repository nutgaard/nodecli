const os = require('os');
const logging = require('./../utils/logging');
const request = require('request-promise');
const daemon = require('./../deploydaemon/daemon');
const credentials = require('./../utils/credentials');

const jiraUrl = 'https://jira.adeo.no';
const brukernavn = credentials.domenebrukernavn;
const passord = credentials.domenepassord;

function put(url) {
    return request({
        method: 'PUT',
        uri: url
    });
}
function post(url, username, password, json) {
    return request({
        method: 'POST',
        uri: url,
        body: json,
        json: true,
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            user: username,
            pass: password
        }
    });
}

module.exports = function deploy(app, version, miljo) {
    if (!daemon.status()) {
        daemon.start();
    }

    const uid = (''+Math.random()).slice(2);
    const callbackurl = `http://${os.hostname()}:31337/${uid}`;

    const json = {
        fields: {
            project: {
                key: 'DEPLOY'
            },
            issuetype: {
                id: '10902'
            },
            customfield_14811: {
                id: miljo,
                value: miljo
            },
            customfield_14812: app + ':' + version,
            customfield_17410: callbackurl,
            summary: 'Automatisk deploy'
        }
    };

    return post(`${jiraUrl}/rest/api/2/issue`, brukernavn, passord, json)
        .then((resp) => {
            put(`${callbackurl}/${resp.key}`);
            return resp;
        })
        .catch((error) => {
            logging.error("Noe gikk feil", error);
            return {
                ok: false
            };
        });
};