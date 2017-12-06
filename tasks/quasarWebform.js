let gulp = require('gulp'),
	promise = require('bluebird'),
	colors = require('colors'),
	sass = require('gulp-sass'),
	concat = require('gulp-concat'),
	babel = require('gulp-babel'),
	browserify = require('gulp-browserify');

const config = require(`${process.cwd()}/config.js`);
const lib = require(`${config.dirname}/lib.js`);
const qType = 'quasarWebform';

const task = () => {
	return lib.injectCode(quasArgs)
	.then(() => { lib.outputToHtmlFile(quasArgs); });
};

const run = () => {
	return validateInitalArgs().then(task());
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

gulp.task(`${qType}:compile:css`, function () {
	return gulp.src(`${quasArgs.assetsFolder}/src/**/*.scss`)
		// Compile sass
		.pipe(sass())
		// Bundle source files
		.pipe(concat(`${quasArgs.qType}.css`))
		// Ouput single file in asset folder for use with build task
        .pipe(gulp.dest(`${quasArgs.assetsFolder}`))
		.on('error', (err) => { lib.logError(err) })
		.on('end', () => { lib.logInfo(`Style files compiled into ${quasArgs.assetsFolder}/${qType}.css`) });
});
gulp.task(`${qType}:compile:js`, function () {
	return gulp.src(`${quasArgs.assetsFolder}/src/**/*.jsx`)
		.pipe(babel({
			presets: ['env', 'react']
		}))
		.pipe(browserify())
		// Bundle source files
		.pipe(concat(`${quasArgs.qType}.js`, { newLine: `;\n` }))
		// Ouput single file in asset folder for use with build task
		.pipe(gulp.dest(`${quasArgs.assetsFolder}`))
		.on('error', (err) => { lib.logError(err) })
		.on('end', () => { lib.logInfo(`Script files compiled into ${quasArgs.assetsFolder}/${qType}.js`) });
});
gulp.task(`${qType}:compile`, [ `${qType}:compile:js`, `${qType}:compile:css` ]);

gulp.task(`${qType}:build`, [ `${qType}:compile` ], () => {
	if(!quasArgs.noPrompt) {
		return lib.initialPrompt(quasArgs).then(task);
	} else {
		return run();
	}
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
