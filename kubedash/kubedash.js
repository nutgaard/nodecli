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
    const res = exec('kubectl get pod --namespace kubernetes-dashboard --selector k8s-app=kubernetes-dashboard --output jsonpath=\'{.items[0].metadata.name}\'');
    const name = res[0].replace(/'/g, '');


    const cmd = execa('kubectl', ['port-forward','--namespace','kubernetes-dashboard', name ,'9090:9090']);
    cmd.stdout.pipe(process.stdout);
    cmd.catch((error) => console.log('error', error));
}

const args = process.argv.slice(2);
setContext(...args);
startDashboard();
open('http://localhost:9090');
