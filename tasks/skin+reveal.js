let gulp = require('gulp'),
	template = require('gulp-template'),
	rename = require('gulp-rename'),
	promise = require('bluebird'),
	path = require('path'),
	colors = require('colors'),
	yargs = require('yargs'),
	fs = require('fs');

const adType = 'skin+reveal';
const shim = 'dt-lib-shim.js';
const config = require(`${process.cwd()}/config.js`);
const lib = fs.existsSync(`${config.assetsFolder}/${shim}`) ? require(`${config.assetsFolder}/${shim}`) : require(`${config.dirname}/lib.js`);

const task = () => {
	return lib.injectCode(dtAdsArgs)
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
		dtAdsArgs.targetFilePath = lib.copyTargetFileToOutputPath(dtAdsArgs);
		dtAdsArgs = lib.resolveQuasArgs(dtAdsArgs, args);

		return resolve();
	});
};

gulp.task(`${adType}:build`, () => {
	if(!dtAdsArgs.noPrompt) {
		return lib.initialPrompt(dtAdsArgs).then(task);
	} else {
		return run();
	}
});
gulp.task(`${adType}`, [`${adType}:build`]);

let dtAdsArgs = lib.getDefaultQuasArgs(adType);
dtAdsArgs = lib.registerRequiredQuasArgs(dtAdsArgs, {
	adType: adType,
	skinClickUrl: '!! PASTE SKIN CLICK URL HERE !!',
	revealClickUrl: '!! PASTE REVEAL CLICK URL HERE !!',
	skinImpressionTracker: '!! PASTE SKIN IMPRESSION TRACKER URL HERE !!',
	revealImpressionTracker: '!! PASTE REVEAL IMPRESSION TRACKER URL HERE !!',
	initalArgs: [{
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
		}],
		initalArgsValidation: validateInitalArgs
});

module.exports = {
	qType: adType,
	run,
	validateInitalArgs
};