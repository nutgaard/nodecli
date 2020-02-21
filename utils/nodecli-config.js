const LocalStorage = require('./localstorage');

const ConfigKeys = {
    isInternal: 'isInternal'
};

class NodecliConfig {
    localStorage = new LocalStorage('nodecli-setup');

    configure(config) {
        this.localStorage.clear();
        this.localStorage.setAll(config);
    }

    isInternal() {
        return this.localStorage.get(ConfigKeys.isInternal)
    }

}

module.exports = {
    default: new NodecliConfig(),
    ConfigKeys
};