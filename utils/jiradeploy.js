const logging = require('./../utils/logging');
const request = require('request-promise');

const brukernavn = process.env.domenebrukernavn;
const passord = process.env.domenepassord;

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
            summary: 'Automatisk deploy'
        }
    };

    return post(`${jiraUrl}/rest/api/2/issue`, brukernavn, passord, json)
        .catch((error) => {
            logging.error("Noe gikk feil", error);
            return {
                ok: false
            };
        });
};