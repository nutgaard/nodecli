const fetchImpl = require('node-fetch');
const base64 = require('base-64');
const logging = require('./logging');
const credentials = require('./credentials');

const username = credentials.domenebrukernavn;
const password = credentials.domenepassord;

const fetchbase = (reader) => (input, init) => {
    if (init && init.headers) {
        init.headers.append('Authorization', `Basic ${base64.encode(`${username}:${password}`)}`);
    } else {
        const headers = new fetchImpl.Headers();
        headers.append('Authorization', `Basic ${base64.encode(`${username}:${password}`)}`);
        init = Object.assign(init || {}, { headers });
    }

    return fetchImpl(input, init)
        .then((resp) => {
            if (!resp.ok) {
                logging.error(resp);
                throw new Error('Fetch failed', resp)
            } else {
                return reader(resp);
            }
        }, (error) => {
            logging.error(resp);
            throw new Error('Fetch failed', resp)
        });
};

const fetchJson = fetchbase((resp) => resp.json());
const fetchText = fetchbase((resp) => resp.text());

module.exports = {
    fetchJson,
    fetchText
};