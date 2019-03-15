/**
 * @file lib.js
 * @author Ken Eucker <keneucker@gmail.com>
 */
const path = require('path'),
	tryRequire = require('try-require'),
	os = require('os');

/**
 * @classdesc Contains the path information for loading quasar files.
 * @hideconstructor
 * @export
 * @class QuasarConfig
 * @example 
	const QuasarConfig = require('config.js');
	const config = new QuasarConfig();
 */
class QuasarConfig {
	constructor(applicationRoot) {
		this.init(applicationRoot);
	}

	/**
	 * the absolute path of the application
	 * @readonly
	 * @memberof QuasarConfig
	 * @returns {string} application root path
	 */
	get applicationRoot() {
		return this._applicationRoot;
	}

	/**
	 * the absolute path of the package
	 * @readonly
	 * @memberof QuasarConfig
	 * @returns {string} module root path
	 */
	get moduleRoot() {
		return this._moduleRoot;
	}

	/**
	 * the absolute path of the assets folder
	 * @readonly
	 * @memberof QuasarConfig
	 * @returns {string} assets folder path
	 */
	get assetsFolder() {
		return this._assetsFolder;
	}

	/**
	 * the absolute path of the debris folder
	 * @readonly
	 * @memberof QuasarConfig
	 * @returns {string} debris folder path
	 */
	get debrisFolder() {
		return this._debrisFolder;
	}

	/**
	 * the absolute path of the snippets folder
	 * @readonly
	 * @memberof QuasarConfig
	 * @returns {string} snippets folder path
	 */
	get snippetsFolder() {
		return this._snippetsFolder;
	}

	/**
	 * @description initializes the configuration values from an applicationRoot which defaults to the running process location
	 * @param {string} applicationRoot defaults to the running process location
	 * @param {string} [outputRoot=null] the output root location
	 * @memberof QuasarConfig
	 */
	init(applicationRoot, outputRoot, moduleRoot) {
		applicationRoot = applicationRoot || process.cwd();
		moduleRoot = moduleRoot || path.resolve(`${__dirname}/../`);
		outputRoot = outputRoot || path.resolve(`${os.homedir()}/Documents/quasar`);

		const configFilename = path.resolve(`${applicationRoot}/config.json`);

		if (tryRequire(configFilename)) {
			this.env = require(configFilename);
		} else {
			this.env = {};
		}

		const packageJsonFilename = path.resolve(`${moduleRoot}/package.json`);

		if (tryRequire(packageJsonFilename)) {
			this.quasarVersion = require(packageJsonFilename).version;
		} else {
			this.quasarVersion = '?';
		}

		this._applicationRoot = applicationRoot;
		this._moduleRoot = moduleRoot;
		this._outputRoot = outputRoot;
		this._templatesFolder = path.resolve(`${moduleRoot}/templates`);
		this._debrisFolder = path.resolve(`${moduleRoot}/code/debris`);
		this._snippetsFolder = path.resolve(`${moduleRoot}/code/snippets`);
		this._node_modules = path.resolve(`${moduleRoot}/node_modules`);
		this._quasarsFolder = path.resolve(`${moduleRoot}/quasars`);

		this._outputFolder = path.resolve(`${outputRoot}/public`);
		this._sourcesFolder = path.resolve(`${outputRoot}/sources`);
		this._assetsFolder = path.resolve(`${outputRoot}/assets`);
		this._jobsFolder = path.resolve(`${outputRoot}/jobs`);

		this._tasks = [];
	}

	/**
	 * @description the absolute path of the jobs folder
	 * @readonly
	 * @memberof QuasarConfig
	 * @returns {string} jobs folder path
	 */
	get jobsFolder() {
		return this._jobsFolder;
	}

	/**
	 * @description the absolute path of the node_modules folder
	 * @readonly
	 * @memberof QuasarConfig
	 * @returns {string} node_modules folder path
	 */
	get node_modules() {
		return this._node_modules;
	}

	/**
	 * @description the absolute path of the output folder
	 * @readonly
	 * @memberof QuasarConfig
	 * @returns {string} output folder path
	 */
	get outputFolder() {
		return this._outputFolder;
	}

	/**
	 * @description the absolute path of the output root folder
	 * @readonly
	 * @memberof QuasarConfig
	 * @returns {string} output folder path
	 */
	get outputRoot() {
		return this._outputRoot;
	}

	/**
	 * @description the absolute path of the quasars folder
	 * @readonly
	 * @memberof QuasarConfig
	 * @returns {string} quasars folder path
	 */
	get quasarsFolder() {
		return this._quasarsFolder;
	}

	/**
	 * @description the absolute path of the sources folder
	 * @readonly
	 * @memberof QuasarConfig
	 * @returns {string} sources folder path
	 */
	get sourcesFolder() {
		return this._sourcesFolder;
	}

	/**
	 * @description an array of tasks for this configuration
	 * @readonly
	 * @memberof QuasarConfig
	 * @returns {array} list of tasks
	 */
	get tasks() {
		return this._tasks;
	}

	/**
	 * @description sets the list of tasks for this configuration
	 * @param {array} tasks
	 * @memberof QuasarConfig
	 */
	set tasks(tasks) {
		this._tasks = tasks;
	}

	/**
	 * @description the absolute path of the templates folder
	 * @readonly
	 * @memberof QuasarConfig
	 * @returns {string} templates folder path
	 */
	get templatesFolder() {
		return this._templatesFolder;
	}
};

module.exports = QuasarConfig;
