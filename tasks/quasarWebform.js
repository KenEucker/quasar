let gulp = require('gulp'),
	colors = require('colors'),
	file = require('gulp-file'),
	runSequence = require('run-sequence'),
	promise = Promise;

const qType = path.basename(__filename).split('.')[0];
let lib = null;
let quasArgs = {};

const task = () => {
	quasArgs = lib.logBuildQueued(quasArgs);
	return lib.injectCode(quasArgs)
		.then(() => { return lib.copyFilesFromTemplatesFolderToOutput(quasArgs, ['app.js', 'package.json', 'img/**', 'fonts/**']) })
		.then(() => { return lib.copyFilesToOutput(quasArgs, quasArgs.applicationRoot, ['icon.ico']) })
		.then(() => { return lib.outputToHtmlFile(quasArgs) });
}

const run = (args = {}) => { return validateRequiredArgs(args).then(task) }
const getQuasarPrompts = () => { return quasArgs.requiredArgs || [] }

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
	gulp.task(`${qType}:compile:html`, () => {
		return lib.compileTargetFileToAssetsFolder(quasArgs);
	});
	gulp.task(`${qType}:compile:css`, () => {
		return lib.compileStylesToAssetsFolder(quasArgs);
	});
	gulp.task(`${qType}:compile:js`, () => {
		return lib.compileScriptsToAssetsFolder(quasArgs);
	});
	gulp.task(`${qType}:compile:sources`, [`${qType}:compile:js`, `${qType}:compile:css`, `${qType}:compile:html`]);

	gulp.task(`${qType}:precompile`, () => {

		const tasks = lib.getFilenamesInDirectory(`${quasArgs.applicationRoot}/tasks/`, ['js'], true);
		let formsData = [];
		// format questions for react-jsonshcema-form
		tasks.forEach((task) => {
			if(task == quasArgs.qType) {
				return;
			}
			const taskFile = require(`./${task}.js`);
			const taskPrompts = taskFile.getQuasarPrompts(lib);
			let required = [], properties = {}, uiSchema = {}, formData = {};
			// if(!taskPrompts) { console.log('PROBLEMO!', task, taskPrompts); }

			taskPrompts.forEach((prompt) => {
				const name = prompt.name;
				if (prompt.required) {
					required.push(name);
				}
				properties[name] = lib.convertPromptToJsonSchemaFormProperty(prompt);
				uiSchema[name] = lib.convertPromptToJsonSchemaUIFormProperty(prompt);
				formData[name] = prompt.default;
			});
			const schema = {
				title: `quasar::${task} -- ${taskFile.purpose}`,
				type: "object",
				required: required,
				properties: properties
			};
			formsData.push({ name: task, schema: schema, uiSchema: uiSchema, formData: formData });
		});

		const formDataJsonString = JSON.stringify(formsData);

		// Stringify the formData and then put it into a template object to be consumed by the template engine and placed on the page as a JSON object
		const templateData = { quasarForms: formDataJsonString }
		return file('quasarWebform.mustache.json', JSON.stringify(templateData), { src: true })
			.pipe(gulp.dest(`${quasArgs.templatesFolder}`));
	});
	gulp.task(`${qType}:compile`, (callback) => {
		runSequence(`${qType}:precompile`,
			`${qType}:compile:sources`,
			callback);
	});

	gulp.task(`${qType}:build`, [`${qType}:compile`], (done) => {
		return run({ domain: 'quasar', signal: 'Webform', output: 'index.html', overwriteDestinationPath: true });
	});
	gulp.task(`${qType}`, [`${qType}:build`]);

	lib.debug(`did register all tasks for quasar ${quasArgs.qType}`);
}

const init = (_lib = null, applicationRoot = path.resolve('../../'), config = null, registerBuildTasks = false) => {
	if (!_lib) {
		config = config ? config : require(`${applicationRoot}/config.js`);
		lib = require(`${config.applicationRoot}/lib.js`);
	} else {
		lib = _lib;
	}

	quasArgs = lib.getQuasArgs(qType, getQuasarPrompts(lib, config), {
		outputExt: '.html',
		requiredArgsValidation: validateRequiredArgs
	}, false);

	if (registerBuildTasks) {
		registerTasks();
	}

	// console.log('initialized');
	return quasArgs;
}

module.exports = {
	purpose: `
		builds a form using react and the json schema pulled directly from the available quasars 
		installed and allows you to run quasar build tasks with a web ui.
	`,
	getQuasarPrompts,
	registerTasks,
	qType,
	init,
	run
};
