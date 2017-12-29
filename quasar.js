class quasarRuntime {
    constructor() {
        this._cli = require('./cli');
    }

    get api() {
        // TODO: implement a public wrapper for methods in lib that is key string based
        return undefined;
    }

    get app() {
        return this._cli.app || undefined;
    }

    get cli() {
        return this._cli || undefined;
    }

    runCLI(args = {}) {
        return this._cli.run(args);
    }

    loadQuasars(quasars = null) {
        return this._cli.loadQuasars(quasars);
    }

}

module.exports = new quasarRuntime();