class Config {
	constructor() { this.init(process.cwd()) }

	init(dirname) {
		this._dirname = dirname;
		this._node_modules = `${dirname}/node_modules`,
		this._outputFolder = `${dirname}/public`,
		this._sourceFolder = `${dirname}/sources`,
		this._assetsFolder = `${dirname}/assets`,
		this._jobsFolder = `${dirname}/jobs`,
		this._tasksFolder = `${dirname}/tasks`,
		this._templatesFolder = `${dirname}/templates`
	}

	get dirname() {
		return this._dirname;
	}

	get node_modules() {
		return this._node_modules;
	}

	get jobsFolder() {
		return this._jobsFolder;
	}

	get outputFolder() {
		return this._outputFolder;
	}

	get tasksFolder() {
		return this._tasksFolder;
	}

	get sourceFolder() {
		return this._sourceFolder;
	}

	get assetsFolder() {
		return this._assetsFolder;
	}

	get templatesFolder() {
		return this._templatesFolder;
	}
};

module.exports = new Config();