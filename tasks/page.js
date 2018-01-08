let gulp = require('gulp'),
	colors = require('colors'),
	promise = Promise;

const qType = path.basename(__filename).split('.')[0];
let lib = null;
let quasArgs = {};

const task = () => {
	quasArgs = lib.logBuildQueued(quasArgs);

	return lib.copyFilesFromSourcesFolderToOutput(quasArgs)
		.then(() => {
			console.log("injecting assets!");
			quasArgs = lib.copyTemplateFilesToAssetsPath(quasArgs);
			return lib.injectCode(quasArgs)
		})
		.then(() => {
			console.log("moving files!");
			return lib.copyFilesFromAssetsFolderToOutput(quasArgs, ['**'])
		})
		.then(() => {
			console.log("output!");
			return lib.outputToHtmlFile(quasArgs)
		})
}

const run = (args = {}) => { return validateRequiredArgs(args).then(task) }

const getQuasarPrompts = (_lib = null, config = null) => {
	if (!quasArgs.requiredArgs) {
		if (!_lib) {
			config = config ? config : require(`${path.resolve('./')}/config.js`);
			lib = require(`${config.applicationRoot}/lib.js`);
		} else {
			lib = _lib;
		}

		quasArgs = lib.registerRequiredQuasArgs({ qType }, [{
			type: 'list',
			name: 'source',
			message: `Enter the source filename (default .zip)`,
			choices: ['none'].concat(lib.getFilenamesInDirectory(lib.getConfig().sourceFolder, ['zip']))
		}, {
			type: 'input',
			name: 'body',
			message: 'Enter the body text',
			default: '',
			optional: true
		}]);
	}

	return quasArgs.requiredArgs;
}

const validateRequiredArgs = (args = {}) => {
	return new promise((resolve, reject) => {
		// Merge options with passed in parameters
		quasArgs = Object.assign(quasArgs, args);

		if (quasArgs.source == 'none') {
			quasArgs.source = null;
		} else if (quasArgs.source && quasArgs.source.length) {
			const split = quasArgs.source.split('.');

			if (split.length > 1) {
				quasArgs.sourceExt = `.${split.pop()}`;
				quasArgs.source = quasArgs.source.substr(0, quasArgs.source.length - quasArgs.sourceExt.length);
			}
		}

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

		return resolve(quasArgs);
	})
}

const registerTasks = () => {
	lib.debug(`will register task [${quasArgs.qType}] and [will${quasArgs.noPrompt ? ' not' : ''}] prompt the user`);

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

	quasArgs = lib.getQuasArgs(qType, getQuasarPrompts(lib, config),
		{
			outputExt: '.html',
			requiredArgsValidation: validateRequiredArgs
		});

	if (registerBuildTasks) {
		registerTasks();
	}

	// console.log('initialized');
	return quasArgs;
}

module.exports = {
	purpose: `
		builds out a single html page from a set of singular assets: css, html, js 
		with options to import files from an archived source
	`,
	getQuasarPrompts,
	registerTasks,
	qType,
	init,
	run
};
