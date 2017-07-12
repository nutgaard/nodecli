const fs = require('fs');
const path = require('path');

function load(file) {
    if (fs.existsSync(file)) {
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
    return {};
}
function save(file, content) {
    fs.writeFileSync(file, JSON.stringify(content));
}

function checkDir() {
    let dir = path.resolve('/nodecli-tmp');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

class Localstorage {
    constructor(name) {
        checkDir();
        this.file = path.resolve('/nodecli-tmp', `${name}.config`);
        this.content = load(this.file);
    }

    get(key) {
        return this.content[key];
    }

    set(key, value) {
        this.content[key] = value;
        save(this.file, this.content);
    }

    setAll(obj) {
        this.content = Object.assign(this.content, obj);
        save(this.file, this.content);
    }

    delete(key) {
        delete this.content[key];
        save(this.file, this.content);
    }

    clear() {
        save(this.file, {});
    }
}

module.exports = Localstorage;