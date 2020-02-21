#!node
const execa = require('execa');
const open = require('open');

function exec(str) {
    return execa.shellSync(str)
        .stdout
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
}
function setContext(context) {
    console.log(exec(`kubectl config use-context ${context}`).join('\n'));
}
function startDashboard() {
    // kubectl port-forward deployment/kubernetes-dashboard 9090:9090 --namespace kubernetes-dashboard
    // const cmd = execa('kubectl', ['port-forward','--namespace','kubernetes-dashboard', name ,'9090:9090']);
    const cmd = execa('kubectl', 'port-forward deployment/kubernetes-dashboard 9090:9090 --namespace kubernetes-dashboard'.split(' '));
    cmd.stdout.pipe(process.stdout);
    cmd.catch((error) => console.log('error', error));
}

const args = process.argv.slice(2);
setContext(...args);
startDashboard();
open('http://localhost:9090');
