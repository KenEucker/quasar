let gulp = require('gulp'),
	colors = require('colors'),
	file = require('gulp-file'),
	runSequence = require('run-sequence'),
	promise = Promise;

const qType = path.basename(__filename).split('.')[0];
let lib = null;
let quasArgs = {};

// console.log('required');

const task = () => {
	return lib.outputToJsonFile(quasArgs);
}

const run = (args = {}) => { return validateRequiredArgs(args).then(task) }
const getQuasarPrompts = (_lib = null, config = null) => {
	// TODO:
	let requiredArgs = [];

	return requiredArgs;
}

const validateRequiredArgs = (args = {}) => {
	return new promise((resolve, reject) => {
		// Merge options with passed in parameters
		quasArgs = Object.assign(quasArgs, args);

		if (quasArgs.output && quasArgs.output.length) {
			const split = quasArgs.output.split('.');

			if (split.length > 1) {
				quasArgs.outputExt = `.${split.pop()}`;
				quasArgs.output = quasArgs.output.substr(0, quasArgs.output.length - quasArgs.outputExt.length);
			}
		} else {
			//Default the output filename to the signal
			quasArgs.output = `${quasArgs.signal}_${quasArgs.qType}`;
		}
		quasArgs = lib.copyTemplateFilesToAssetsPath(quasArgs);

		return resolve(quasArgs);
	});
}

const registerTasks = () => {
	gulp.task(`${qType}:build`, () => {
		if (!quasArgs.noPrompt) {
			return lib.promptUser(quasArgs)
				.then(task);
		} else {
			return run();
		}
	});
	gulp.task(`${qType}`, [`${qType}:build`]);

	lib.debug(`did register all tasks for quasar ${quasArgs.qType}`);
}

const init = (_lib = null, applicationRoot = process.cwd(), config = null, registerBuildTasks = false) => {
	if (!_lib) {
		config = config ? config : require(`${applicationRoot}/config.js`);
		lib = require(`${config.applicationRoot}/lib.js`);
	} else {
		lib = _lib;
    }
    


	quasArgs = lib.getQuasArgs(qType, getQuasarPrompts(lib, config), {
		outputExt: '.json',
		requiredArgsValidation: validateRequiredArgs
	}, false);

	if (registerBuildTasks) {
		registerTasks();
	}

	// console.log('initialized');
	return quasArgs;
}

// registerTasks();

module.exports = {
	purpose: `
        takes the information present in all available quasars (the defaults), 
        allows the user to select which quasar they want to build, 
        presents the user with downloadable starter templates, 
        and outputs a build ticket for the user to record for 
        continuing the build with all of the completed assets later.
	`,
	getQuasarPrompts,
	registerTasks,
	qType,
	init,
	run
};
