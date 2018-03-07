#!node
const Cli = require('./../utils/cliutils').Cli;
const Command = require('./../utils/cliutils').Command;
const logging = require('./../utils/logging');
const { getGitRoot, hasLocalChanges } = require('./../utils/gitutils');
const { lstatSync, readdirSync } = require('fs');
const { join, basename } = require('path');
const { fork } = require('child_process');

const isDirectory = (source) => (name) => lstatSync(join(source, name)).isDirectory();
function getDirectories(source) {
    return readdirSync(source)
        .filter(isDirectory(source))
        .map((dirname) => ({ dirname, path: join(source, dirname) }));
}

function scangit(source) {
    logging.info(`Scanning ${source}`);
    process.chdir(source);
    return hasLocalChanges();
}

const parallellism = 8;
class ScangitCommand extends Command {
    execute() {
        let workers;
        const root = getGitRoot();
        if (root) {
            this.printdata([{
                dirname: basename(root),
                changes: scangit(root)
            }]);
        } else {
            const response = [];
            workers = new Array(parallellism).fill(0).map(() => {
                const worker = fork(join(__dirname, 'worker.js'));
                worker.on('message', (data) => response.push(data));
                return worker;
            });

            const directories = getDirectories(process.cwd());//.slice(0, 16);
            directories
                .forEach((source, index) => {
                    const worker = workers[index % workers.length];
                    worker.send(source);
                });

            const interval = setInterval(() => {
                if (response.length === directories.length) {
                    workers.forEach((worker) => worker.kill('SIGINT'));
                    this.printdata(response);
                    clearInterval(interval);
					console.log(`I scanned ${response.length} directories for you...`);
                }
            }, 500);

        }
    }

    executeSync() {
        let difflist;
        const root = getGitRoot();
        if (root) {
            difflist = [{dirname: basename(root), changes: scangit(root)}];
        } else {
            difflist = getDirectories(process.cwd())
                .slice(0, 10)
                .filter(({ dirname, path }) => {
                    logging.info(`Checking gitroot ${dirname}`);
                    process.chdir(path);
                    return getGitRoot() !== false;
                })
                .map(({ path, dirname }) => ({
                    dirname,
                    changes: scangit(path)
                }))
                .filter(({ changes }) => changes !== false);
        }

        this.printdata(difflist);
    }

    printdata(data) {
        logging.spacer(2);
        data
            .filter(({ changes}) => changes !== false)
            .forEach(({ dirname, changes }) => {
                const l = logging.info(`Changes for ${dirname}`);
                logging.line(l);
                logging.pure(`Diff\t\t${changes.diff}`);
                logging.pure(`Diffcache\t${changes.diffcache}`);
                logging.pure(`Untracked\t${changes.untracked}`);
                logging.line(l);
                logging.spacer();
            })
    }

    help() {
        return {
            args: '',
            msg: 'Scans all subfolders for local git-changes'
        };
    }
}


const cli = new Cli('scangit', {
    '': new ScangitCommand()
});

cli.run();