class quasarRuntime {
    constructor() {
        this._cli = require('./cli');
    }

    get api() {
        // TODO: implement a public wrapper for methods in lib that is key string based
        return null;
    }

    get app() {
        return this._cli.app;
    }

    get cli() {
        return this._cli;
    }

}

module.exports = new quasarRuntime();