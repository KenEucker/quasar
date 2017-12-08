let gulp = require('gulp'),
	promise = require('bluebird'),
	colors = require('colors'),
	sass = require('gulp-sass'),
	concat = require('gulp-concat'),
	babel = require('gulp-babel'),
	file = require('gulp-file'),
	flatmap = require('gulp-flatmap'),
	fs = require('fs'),
	runSequence = require('run-sequence'),
	tap = require('gulp-tap'),
	mustache = require('gulp-mustache'),
	browserify = require('gulp-browserify');

const config = require(`${process.cwd()}/config.js`);
const lib = require(`${config.dirname}/lib.js`);
const qType = 'quasarWebform';

const task = () => {
	return lib.injectCode(quasArgs)
		.then(() => { return lib.copyFilesFromTemplatesFolderToOutput(quasArgs, ['app.js', 'package.json', 'img/**', 'fonts/**'])})
		.then(() => { return lib.outputToHtmlFile(quasArgs) });
}

const run = (args = {}) => {
	return validateRequiredArgs(args).then(task);
}

const getQuasarPrompts = () => {
	return quasArgs.requiredArgs;
}

const validateRequiredArgs = (args = {}) => {
	return new Promise((resolve, reject) => {
		// Merge options with passed in parameters
		quasArgs = Object.assign(quasArgs, args);
		
		if(quasArgs.output && quasArgs.output.length) {
			const split = quasArgs.output.split('.');

			if(split.length > 1) {
				quasArgs.outputExt = split.pop();
				quasArgs.output = quasArgs.output.substr(0, quasArgs.output.length - quasArgs.outputExt.length - 1);
			}
		} else {
			//Default the output filename to the signal
			quasArgs.output = `${quasArgs.signal}_${quasArgs.qType}`;
		}
		quasArgs = lib.copyTemplateFilesToAssetsPath(quasArgs);

		return resolve(quasArgs);
	});
}

const convertPromptToJsonSchemaFormProperty = (prompt) => {
	let title = prompt.message,
		type = prompt.type;

	switch(type) {
		case 'input':
			type = 'string';
		break;
		case 'list':
			if(prompt.name == 'source') {
				type = 'string'
				_default = prompt.choices
			}
		break;
		default:
		break;
	}

	return {
		type,
		title
	};
}

const convertPromptToJsonSchemaUIFormProperty = (prompt) => {
	let title = prompt.message || '',
		widget = prompt.type || 'input',
		help = prompt.help || '';

	switch(widget) {
		case 'input':
			widget = 'text';
		break;

		case 'list':
			if(prompt.name == 'source') {
				widget = 'file';
			} else {
				widget = 'checkboxes';
			}
		break;
	}

	return {
		'ui:widget': widget,
		help
	};
}

gulp.task(`${qType}:compile:html`, () => {
	return gulp.src(`${quasArgs.templatesFolder}/**/*.mustache`)
		// Compile mustache file
		.pipe(flatmap( (stream, file) => {
			const filename = `${file.path}.json`;

			if(fs.existsSync(filename)) {
				return stream.pipe(mustache(filename, {}, {}));
			} else {
				return stream.pipe(mustache());
			}
		}))
		// Bundle source files
		.pipe(concat(`${quasArgs.qType}.html`), { newLine: `\n<!-- Section -->\n` })
		// Ouput single file in asset folder for use with build task
		.pipe(gulp.dest(`${quasArgs.assetsFolder}`))
		.on('error', (err) => { lib.logError(err) })
		.on('end', () => { lib.logInfo(`Document files compiled into ${quasArgs.assetsFolder}/${qType}.html`); });
});
gulp.task(`${qType}:compile:css`, () => {
	return gulp.src(`${quasArgs.templatesFolder}/**/*.scss`)
		// Compile sass
		.pipe(sass())
		// Bundle source files
		.pipe(concat(`${quasArgs.qType}.css`))
		// Ouput single file in asset folder for use with build task
		.pipe(gulp.dest(`${quasArgs.assetsFolder}`))
		.on('error', (err) => { lib.logError(err) })
		.on('end', () => { lib.logInfo(`Style files compiled into ${quasArgs.assetsFolder}/${qType}.css`); });
});
gulp.task(`${qType}:compile:js`, () => {
	return gulp.src(`${quasArgs.templatesFolder}/**/*.jsx`)
		// Bundle source files
		.pipe(concat(`${quasArgs.qType}.js`, { newLine: `;\n` }))
		// Make it useful
		.pipe(babel({ presets: ['env', 'react'] }))
		// Make it compatible
		.pipe(browserify())
		// Ouput single file in asset folder for use with build task
		.pipe(gulp.dest(`${quasArgs.assetsFolder}`))
		.on('error', (err) => { lib.logError(err) })
		.on('end', () => { lib.logInfo(`Script files compiled into ${quasArgs.assetsFolder}/${qType}.js`); });
});
gulp.task(`${qType}:compile:sources`, [ `${qType}:compile:js`, `${qType}:compile:css`, `${qType}:compile:html` ]);

gulp.task(`${qType}:precompile`, () => {

	const tasks = lib.getFilenamesInDirectory(`${quasArgs.dirname}/tasks/`, ['js'], true);
	let formsData = [];
	// format questions for react-jsonshcema-form
	tasks.forEach((task) => {
		const taskFile = require(`./${task}.js`)
		const taskPrompts = taskFile.getQuasarPrompts();
		let required = [], properties = {}, uiSchema = {};

		taskPrompts.forEach((prompt) => {
			const name = prompt.name;
			if(prompt.required) {
				required.push(name);
			}
			properties[name] = convertPromptToJsonSchemaFormProperty(prompt);
			uiSchema[name] = convertPromptToJsonSchemaUIFormProperty(prompt);
		});
		const schema = {
			title: `Quasar::${task} -- ${taskFile.purpose}`,
			type: "object",
			required: required,
			properties: properties
		};
		formsData.push({ name: task, schema: schema, uiSchema: uiSchema });
	});

	const formDataJsonString = JSON.stringify(formsData);
	
	// Stringify the formData and then put it into a template object to be consumed by the template engine and placed on the page as a JSON object
	const templateData = { quasarForms: formDataJsonString }
	return file('quasarWebform.mustache.json', JSON.stringify(templateData), { src: true })
		.pipe(gulp.dest(`${quasArgs.templatesFolder}`));
});
gulp.task(`${qType}:compile`, function(callback) {
	runSequence(`${qType}:precompile`,
				`${qType}:compile:sources`,
				callback);
  });

gulp.task(`${qType}:build`, [ `${qType}:compile` ], (done) => {
	return run({ domain: 'quasar', signal: 'Webform', output: 'index.html', overwriteDestinationPath: true });
});
gulp.task(`${qType}`, [`${qType}:build`]);

let quasArgs = lib.getDefaultQuasArgs(qType);
quasArgs = lib.registerRequiredQuasArgs(quasArgs, [], {
	outputExt: 'html',
	requiredArgsValidation: validateRequiredArgs
}, false);

module.exports = {
	purpose: `
		builds a form using react and the json schema pulled directly from the available quasars 
		installed and allows you to run quasar build tasks with a web ui.
	`,
	getQuasarPrompts,
	qType,
	run
};
