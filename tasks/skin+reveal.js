let gulp = require('gulp'),
	template = require('gulp-template'),
	prompt = require('inquirer'),
	rename = require('gulp-rename'),
	promise = require('bluebird'),
	path = require('path'),
	colors = require('colors'),
	yargs = require('yargs');

const adType = 'skin+reveal';
const config = require(`${process.cwd()}/config.js`);
const lib = require(`${config.dirname}/lib.js`);
let dtAdsArgs = lib.getDefaultAdArgs(adType);

let _dtAdsArgs = {
	skinClickUrl: '!! PASTE SKIN CLICK URL HERE !!',
	revealClickUrl: '!! PASTE REVEAL CLICK URL HERE !!',
	skinImpressionTracker: '!! PASTE SKIN IMPRESSION TRACKER URL HERE !!',
	revealImpressionTracker: '!! PASTE REVEAL IMPRESSION TRACKER URL HERE !!',
};
dtAdsArgs = Object.assign(dtAdsArgs, _dtAdsArgs);

const task = () => {
	return lib.injectAdCode(dtAdsArgs)
	.then(() => { lib.outputToHtmlFile(dtAdsArgs); });
};

const run = () => {
	return validateInitalArgs().then(task());
};

const validateInitalArgs = (args) => {
	return new Promise((resolve, reject) => {
		dtAdsArgs = Object.assign(dtAdsArgs, args);

		if(dtAdsArgs.output && dtAdsArgs.output.length) {
			const split = dtAdsArgs.output.split('.');

			if(split.length > 1) {
				dtAdsArgs.outputExt = split.pop();
				dtAdsArgs.output = dtAdsArgs.output.substr(0, dtAdsArgs.output.length - dtAdsArgs.outputExt.length - 1);
			}
		} else {
			//Default the output filename to the campaign
			dtAdsArgs.output = `${dtAdsArgs.campaign}_${dtAdsArgs.adType}`;
		}

		return resolve();
	});
};

const initialPrompt = function() {
	// Only get the campaign questions if they weren't passed in
	let questions = !(dtAdsArgs.campaign && dtAdsArgs.client) ? lib.getCampaignPromptQuestions() : [];
	questions.push({
		type: 'input',
		name: 'skinImage',
		message: 'Enter the url for the skin image:'
	},
	{
		type: 'input',
		name: 'skinColor',
		message: 'Enter the color for the skin:'
	},
	{
		type: 'input',
		name: 'revealImage',
		message: 'Enter the url for the reveal image:'
	},
	{
		type: 'input',
		name: 'revealTimerColor',
		message: 'Enter the color for the reveal timer:'
	},
	{
		type: 'input',
		name: 'output',
		message: `Enter the output filename postfix (default extension .${dtAdsArgs.outputExt} ${colors.yellow('(optional)')}):\n`
	});

	return prompt.prompt(questions).then(validateInitalArgs);
}

gulp.task(`${adType}:build`, () => {
	if(!dtAdsArgs.noPrompt) {
		return initialPrompt().then(task);
	} else {
		return run();
	}
});
gulp.task(`${adType}`, [`${adType}:build`]);

module.exports = {
	run,
	initialPrompt,
	validateInitalArgs
};