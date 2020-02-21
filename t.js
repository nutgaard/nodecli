const fetch = require('node-fetch');

fetch('https://api.github.com/repos/navikt/henvendelse-les/deployments')
    .then((r) => console.log(r), (r) => console.log(r));