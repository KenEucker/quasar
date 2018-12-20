class Config {
	constructor() { this.init(process.cwd()) }

	init(applicationRoot, outputRoot = null) {
		outputRoot = outputRoot ? path.resolve(outputRoot) : applicationRoot;

		this._applicationRoot = applicationRoot;
		this._templatesFolder = `${applicationRoot}/templates`;
		this._node_modules = `${applicationRoot}/node_modules`;
		this._tasksFolder = `${applicationRoot}/tasks`;

		this._outputFolder = `${outputRoot}/public`;
		this._sourceFolder = `${outputRoot}/sources`;
		this._assetsFolder = `${outputRoot}/assets`;
		this._jobsFolder = `${outputRoot}/jobs`;
	}

	get applicationRoot() {
		return this._applicationRoot;
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