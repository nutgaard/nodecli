const LocalStorage = require('./../utils/localstorage');

const daemon = require('daemonize2').setup({
    main: "checker.js",
    name: "RFC-checker",
    pidfile: LocalStorage.getFile("rfc-checker.pid"),
    silent: false
});

daemon
    .on('starting', () => { console.log('Starting RFC-Checker'); })
    .on('started', () => { console.log('Started RFC-Checker'); })
    .on('stopping', () => { console.log('Stopping RFC-Checker'); })
    .on('stopped', () => { console.log('Stopped RFC-Checker'); })
    .on('running', () => { console.log('Running RFC-Checker'); })
    .on('notrunning', () => { console.log('Not running RFC-Checker'); })
    .on('error', (err) => { console.log('Error RFC-Checker', err.message); });

module.exports = daemon;