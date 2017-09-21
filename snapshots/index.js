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

function fixXMLStructure(elements) {
    return Object.entries(elements)
        .map(([key, value]) => [key, value[0]])
        .reduce((acc, [key, value]) => Object.assign(acc, { [key]: value }), {});
}

function getDependencies(project) {
    return project.dependencies && project.dependencies[0].dependency;
}

function getDependencyManagement(project) {
    return project.dependencyManagement && project.dependencyManagement[0].dependencies[0].dependency;
}

function injectProperties(properties) {
    const varRegex = /\${(.+?)}/;
    return (dependency) => {
        const execRes = varRegex.exec(dependency.version);
        if (execRes) {
            const [, varName] = execRes;
            return Object.assign(dependency, { version: properties[varName]} );
        }
        return dependency;
    };
}

function getDependenciesDefinition({ project }, properties) {
    const dependencies = getDependencies(project) || getDependencyManagement(project);
    return dependencies
        .map(fixXMLStructure)
        .map(injectProperties(properties));
}

function toPrintStatement(dependency) {
    return `${dependency.groupId}:${dependency.artifactId}:${dependency.version}${dependency.scope ? `:${dependency.scope}` : ''}`;
}

function handlePomXml(file) {
    xml(fs.readFileSync(file, 'UTF-8'), (err, result) => {
        if (err) {
            logging.error(err);
            return;
        }

        logging.spacer();
        logging.info(`Fant versjoner i ${file}.`);
        logging.spacer();
        const properties = fixXMLStructure(result.project.properties ? result.project.properties[0]: {});

        const snapshots = getDependenciesDefinition(result, properties)
            .filter(({ version }) => version.includes('SNAPSHOT'))
            .map(toPrintStatement)
            .sort();

        snapshots.forEach((statement) => logging.info(statement));


        if (snapshots.length > 0) {
            logging.spacer();
            logging.warn(`Found ${snapshots.length} artifacts with a SNAPSHOT-version...`);
            logging.warn(`Releasing this artifact to nexus is not recommended.`);
        } else {
            logging.ok('No SNAPSHOT-versions found...');
        }
    });
}

const files = [
    { file: path.join(process.cwd(), 'pom.xml'), handler: handlePomXml },
    { file: path.join(getGitRoot(), 'pom.xml'), handler: handlePomXml }
];

const activeHandler = files.find(({file}) => hasFile(file));
if (!activeHandler) {
    logging.info("Fant ingen pom.xml");
    return;
}
activeHandler.handler(activeHandler.file);