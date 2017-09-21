#!node
const fs = require('fs');
const path = require('path');
const execa = require('execa');
const xml = require('xml2js').parseString;
const logging = require('./../utils/logging');

function getGitRoot() {
    return execa.shellSync('git rev-parse --show-toplevel').stdout
}

function hasFile(file) {
    return fs.existsSync(file);
}

function handlePackageJson(file) {
    const pkg = JSON.parse(fs.readFileSync(file, 'UTF-8'));
    logging.spacer();
    logging.info(`Fant versjon i ${file}.`);
    logging.info(`Versjon: ${pkg.version}`);
}

function handlePomXml(file) {
    xml(fs.readFileSync(file, 'UTF-8'), (err, result) => {
        if (err) {
            logging.error(err);
            return;
        }

        logging.spacer();
        logging.info(`Fant versjon i ${file}.`);
        logging.info(`Versjon: ${result.project.version[0]}`);
    });
}

const files = [
    { file: path.join(process.cwd(), 'package.json'), handler: handlePackageJson },
    { file: path.join(process.cwd(), 'pom.xml'), handler: handlePomXml },
    { file: path.join(getGitRoot(), 'package.json'), handler: handlePackageJson },
    { file: path.join(getGitRoot(), 'pom.xml'), handler: handlePomXml }
];

const activeHandler = files.find(({file}) => hasFile(file));
if (!activeHandler) {
    logging.info("Fant ingen pom.xml eller package.json");
    return;
}
activeHandler.handler(activeHandler.file);