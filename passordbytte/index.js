#!/usr/local/bin/node
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const fetch = require('node-fetch');
const base64 = require('base-64');
const Log = require('./../utils/logging');

inquirer.prompt([{
        type: 'password',
        name: 'password',
        message: 'Skriv inn ditt nye passord'
    }]
)
    .then(({password}) => ({
        password,
        username: require('os').userInfo().username,
    }))
    .then(getDataFromArtifactory)
    .then(getNpmSecret)
    .then(updateFiles)
    .then(logOk);

function getDataFromArtifactory({ username, password }) {
    Log.info('Henter kryptert passord fra artifactory for ', username);
    return fetch(`https://repo.intra.eika.no/ui/userProfile`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${base64.encode(`${username}:${password}`)}`,
            "accept":"application/json, text/plain, */*",
            "accept-language":"en-US,en;q=0.9,da;q=0.8,nb;q=0.7,sv;q=0.6",
            "content-type":"application/json;charset=UTF-8"
        },
        body: JSON.stringify({ password })
    })
        .then((resp) => {
            if (resp.ok) {
                return resp.json();
            }
            Log.error("Kunne ikke hente info fra artifactory. Sjekk at du skrev riktig passord...");
            process.exit(1);
        })
        .then((json) => {
            Log.info('Ditt krypterte passord: ', json.user.password);
            return { username, password, encrypted: json.user.password };
        })
}

function getNpmSecret({ username, password, encrypted }) {
    return fetch('https://repo.intra.eika.no/api/npm/auth', {
        headers: {
            Authorization: `Basic ${base64.encode(`${username}:${encrypted}`)}`
        }
    }).then((resp) => {
        if (resp.ok) {
            return resp.text();
        }
        Log.error("Kunne ikke hente npm-info fra artifactory. ");
        process.exit(1);
    })
        .then((text) => {
            Log.info('NpmSecret:');
            Log.pure(text);
            return { username, password, encrypted, npmSecret: parseProperties(text) };
        })
}

function updateFiles({ encrypted, npmSecret }) {
    const homedir = require('os').userInfo().homedir;
    const m2File = path.join(homedir, '.m2', 'settings.xml');
    const npmrcFile = path.join(homedir, '.npmrc');

    if (fs.existsSync(m2File)) {
        Log.info("Fant .m2/settings, og erstatter kryptert passord der");
        rewriteFile({
            file: m2File,
            replacementFn: (content) => content.replace(/<password>.+?<\/password>/, `<password>${encrypted}</password>`)
        });
    }

    if (fs.existsSync(npmrcFile)) {
        Log.info("Fant .npmrc, og erstatter properties")
        rewriteFile({
            file: npmrcFile,
            replacementFn: (content) => {
                let newData = parseProperties(content);
                return toStringProperties({ ...newData, ...npmSecret });
            }
        });
    }
}

function logOk() {
    Log.spacer();
    Log.info("Alt gikk som det skulle. Restart terminal etc for å være sikker på at endringene tar effekt...");
    Log.spacer();
}

function rewriteFile({ file, replacementFn, dryRun }) {
    const data = fs.readFileSync(file, 'utf-8');
    const newData = replacementFn(data);

    if (dryRun) {
        Log.info('Skriver til fil: ');
        Log.pure(newData);
    } else {
        fs.writeFileSync(file, newData, 'utf-8');
    }
}

function parseProperties(propStr) {
    return propStr.split('\n')
        .map((line) => {
            const delimiterIndex = line.indexOf('=');
            const key = line.substr(0, delimiterIndex).trim();
            const value = line.substr(delimiterIndex + 1).trim();
            return [key, value];
        })
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
}

function toStringProperties(props) {
    return Object.keys(props)
        .map((key) => `${key} = ${props[key]}`)
        .join('\n');
}