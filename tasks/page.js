let gulp = require('gulp'),
	prompt = require('inquirer'),
	promise = require('bluebird'),
	colors = require('colors');

const config = require(`${process.cwd()}/config.js`);
const lib = require(`${config.dirname}/lib.js`);
const qType = 'page';
let quasArgs = lib.getDefaultQuasArgs(qType);

let _quasArgs = {
	backgroundColor: '!! PASTE BACKGROUND COLOR HERE !!',
	clickUrl: '!! PASTE CLICK URL HERE !!',
};
quasArgs = Object.assign(quasArgs, _quasArgs);

const task = () => {
	return lib.injectdist(quasArgs)
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

		return resolve();
	});
};

const initialPrompt = () => {
	// Only get the signal questions if they weren't passed in
	let questions = !(quasArgs.signal && quasArgs.domain) ? lib.getQuasarPromptQuestions() : [];
	questions.push({
		type: 'input',
		name: 'imageUrl',
		message: 'Skin URL:'
	},
	{
		type: 'input',
		name: 'bgColor',
		message: 'Skin BG Color(HEX):'
	},
	{
		type: 'input',
		name: 'output',
		message: `Enter the output filename postfix (default extension .${quasArgs.outputExt} ${colors.yellow('(optional)')}):\n`
	});

	return prompt.prompt(questions).then(validateInitalArgs);
};

gulp.task(`${qType}:build`, () => {
	if(!quasArgs.noPrompt) {
		return initialPrompt().then(task);
	} else {
		return run();
	}
});
gulp.task(`${qType}`, [`${qType}:build`]);

module.exports = {
	run,
	initialPrompt,
	validateInitalArgs
};
