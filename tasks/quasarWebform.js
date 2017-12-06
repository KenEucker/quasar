let gulp = require('gulp'),
	promise = require('bluebird'),
	colors = require('colors'),
	sass = require('gulp-sass'),
	concat = require('gulp-concat'),
	babel = require('gulp-babel'),
	file = require('gulp-file'),
	runSequence = require('run-sequence'),
	browserify = require('gulp-browserify');

const config = require(`${process.cwd()}/config.js`);
const lib = require(`${config.dirname}/lib.js`);
const qType = 'quasarWebform';

const task = () => {
	return lib.injectCode(quasArgs)
	.then(() => { lib.outputToHtmlFile(quasArgs); });
};

const run = (args = {}) => {
	return validateInitalArgs(args).then(task());
};

const validateInitalArgs = (args = {}) => {
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
		quasArgs.targetFilePath = lib.copyTargetFileToOutputPath(quasArgs);

		return resolve();
	});
};

gulp.task(`${qType}:compile:css`, () => {
	return gulp.src(`${quasArgs.assetsFolder}/src/**/*.scss`)
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
	return gulp.src(`${quasArgs.assetsFolder}/src/**/*.jsx`)
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
gulp.task(`${qType}:compile:sources`, [ `${qType}:compile:js`, `${qType}:compile:css` ]);

gulp.task(`${qType}:precompile`, () => {
	let formData = {};
	formData.schema = {
		title: "Todo",
		type: "object",
		required: ["title"],
		properties: {
		title: {type: "string", title: "Title", default: "A new task"},
		done: {type: "boolean", title: "Done?", default: false}
		}
	};
	formData.uiSchema = {};
		
	const formDataJsonString = JSON.stringify(formData);
	return file('data.jsx', `window.quasarForm = ${formDataJsonString};`, { src: true })
		.pipe(gulp.dest(`${quasArgs.assetsFolder}/src`));
});
gulp.task(`${qType}:compile`, function(callback) {
	runSequence(`${qType}:precompile`,
				`${qType}:compile:sources`,
				callback);
  });

gulp.task(`${qType}:build`, [ `${qType}:compile` ], () => {
	return run({ domain: 'quasar', signal: 'webUI', overwriteDestinationPath: true });
});
gulp.task(`${qType}`, [`${qType}:build`]);

let quasArgs = lib.getDefaultQuasArgs(qType);
quasArgs = lib.registerRequiredQuasArgs(quasArgs, {
	outputExt: 'html',
	initalArgs: [],
		initalArgsValidation: validateInitalArgs
	});

module.exports = {
	qType,
	run
};
