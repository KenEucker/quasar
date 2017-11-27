let gulp = require('gulp'),
	promise = require('bluebird'),
	colors = require('colors'),
	fs = require('fs');

const adType = 'skin';
const shim = 'dt-lib-shim.js';
const config = require(`${process.cwd()}/config.js`);
const lib = fs.existsSync(`${config.assetsFolder}/${shim}`) ? require(`${config.assetsFolder}/${shim}`) : require(`${config.dirname}/lib.js`);
let dtAdsArgs = lib.getDefaultQuasArgs(adType);

dtAdsArgs = lib.registerRequiredQuasArgs(dtAdsArgs, {
	adType: adType,
	clickUrl: '!! PASTE CLICK URL HERE !!',
	impressionTracker: '!! PASTE IMPRESSION TRACKER URL HERE !!',
});

const task = () => {
	return lib.injectAdCode(dtAdsArgs)
	.then(() => { lib.outputToHtmlFile(dtAdsArgs); });
};

const run = () => {
	return validateInitalArgs().then(task());
};

const validateInitalArgs = (args = {}) => {
	return new Promise((resolve, reject) => {
		// Merge options with passed in parameters
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

const initialPrompt = () => {
	// Only get the campaign questions if they weren't passed in
	let questions = !(lib.hasCampaignAnswers(dtAdsArgs)) ? lib.getCampaignPromptQuestions() : [];
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
		message: `Enter the output filename postfix (default extension .${dtAdsArgs.outputExt} ${colors.yellow('(optional)')}):\n`
	});

	return lib.promptConsole(questions, validateInitalArgs);
};

gulp.task(`${adType}:build`, () => {
	if(!dtAdsArgs.noPrompt) {
		return initialPrompt().then(task);
	} else {
		return run();
	}
});
gulp.task(`${adType}`, [`${adType}:build`]);

module.exports = {
	initialPrompt,
	qType: adType,
	run,
	validateInitalArgs
};
