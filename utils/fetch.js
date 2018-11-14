const fetchImpl = require('node-fetch');
const base64 = require('base-64');
const logging = require('./logging');
const credentials = require('./credentials');

const username = credentials.domenebrukernavn;
const password = credentials.domenepassord;

const fetchbase = (reader) => (input, init) => {
    if (init && init.headers) {
        if (init.headers.append) {
            init.headers.append('Authorization', `Basic ${base64.encode(`${username}:${password}`)}`);
        } else {
            init.headers['Authorization'] = `Basic ${base64.encode(`${username}:${password}`)}`;
        }
    } else {
        const headers = new fetchImpl.Headers();
        headers.append('Authorization', `Basic ${base64.encode(`${username}:${password}`)}`);
        init = Object.assign(init || {}, { headers });
    }

    return fetchImpl(input, init)
        .then((resp) => {
            if (!resp.ok) {
                resp.text().then((t) => console.log(t));
                throw new Error('Fetch failed', resp);
            } else {
                return reader(resp);
            }
        }, (error) => {
            logging.error(JSON.stringify(error, null, 2));
            throw new Error('Fetch failed', error)
        });
};

const fetchJson = fetchbase((resp) => resp.json());
const fetchText = fetchbase((resp) => resp.text());

module.exports = {
    fetch: fetchbase((resp) => resp),
    fetchJson,
    fetchText
};