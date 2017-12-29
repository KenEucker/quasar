let gulp = require('gulp'),
	promise = require('bluebird'),
	colors = require('colors');

const config = require(`${process.cwd()}/config.js`);
const lib = require(`${config.dirname}/lib.js`);
const qType = path.basename(__filename).split('.')[0];

let quasArgs = {};

const task = () => {
	return lib.unpackFiles(quasArgs)
	.then(() => { 
		console.log("injecting assets!");
		quasArgs = lib.copyTemplateFilesToAssetsPath(quasArgs);
		return lib.injectCode(quasArgs) })
	.then(() => { 
		console.log("moving files!");
		return lib.copyFilesFromAssetsFolderToOutput(quasArgs, [ '**' ] ) })
	.then(() => { 
		console.log("output!");
		return lib.outputToHtmlFile(quasArgs) })
}

const run = (args = {}) => {
	return validateRequiredArgs(args).then(task)
}

const getQuasarPrompts = () => {
	return quasArgs.requiredArgs
}

const validateRequiredArgs = (args = {}) => {
	return new Promise((resolve, reject) => {
		// Merge options with passed in parameters
		quasArgs = Object.assign(quasArgs, args);
		
		if(quasArgs.source == 'none') {
			quasArgs.source = null;
		} else if(quasArgs.source && quasArgs.source.length) {
			const split = quasArgs.source.split('.');

			if(split.length > 1) {
				quasArgs.sourceExt = `.${split.pop()}`;
				quasArgs.source = quasArgs.source.substr(0, quasArgs.source.length - quasArgs.sourceExt.length);
			}
		}

		if(quasArgs.output && quasArgs.output.length) {
			const split = quasArgs.output.split('.');

			if(split.length > 1) {
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

gulp.task(`${qType}:build`, () => {
	if(!quasArgs.noPrompt) {
		return lib.promptUser(quasArgs)
			.then(task);
	} else {
		return run();
	}
});
gulp.task(`${qType}`, [`${qType}:build`]);

const init = () => {
	quasArgs = lib.getQuasArgs(qType, [{
			type: 'list',
			name: 'source',
			message: `Enter the source filename (default .zip)`,
			choices: ['none'].concat(lib.getFilenamesInDirectory(lib.config.sourceFolder, ['zip']))
		}, {
			type: 'input',
			name: 'body',
			message: 'Enter the body text'
		}],
		{
			outputExt: '.html',
			requiredArgsValidation: validateRequiredArgs });
}

init();
module.exports = {
	purpose: `
		builds out a single html page from a set of singular assets: css, html, js 
		with options to import files from an archived source
	`,
	getQuasarPrompts,
	qType,
	init,
	run
};
