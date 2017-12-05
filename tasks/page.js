let gulp = require('gulp'),
	promise = require('bluebird'),
	colors = require('colors');

const config = require(`${process.cwd()}/config.js`);
const lib = require(`${config.dirname}/lib.js`);
const qType = 'page';

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

gulp.task(`${qType}:build`, () => {
	if(!quasArgs.noPrompt) {
		return lib.initialPrompt(quasArgs).then(task);
	} else {
		return run();
	}
});
gulp.task(`${qType}`, [`${qType}:build`]);

let quasArgs = lib.getDefaultQuasArgs(qType);
quasArgs = lib.registerRequiredQuasArgs(quasArgs, {
	backgroundColor: '!! PASTE BACKGROUND COLOR HERE !!',
	clickUrl: '!! PASTE CLICK URL HERE !!',
	initalArgs: [{
			type: 'input',
			name: 'body',
			message: 'Enter the body text'
		}],
		initalArgsValidation: validateInitalArgs
	});

module.exports = {
	qType,
	run
};
