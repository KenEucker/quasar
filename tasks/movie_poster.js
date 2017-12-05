let gulp = require('gulp'),
	promise = require('bluebird'),
	colors = require('colors'),
	fs = require('fs');

const adType = 'movie_poster';
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

const validateInitalArgs = (args = {}) => {
	return new Promise((resolve, reject) => {
		// Merge options with passed in parameters
		dtAdsArgs = lib.resolveQuasArgs(dtAdsArgs, args);

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
	clickUrl: '!! PASTE CLICK URL HERE !!',
	impressionTracker: '!! PASTE IMPRESSION TRACKER URL HERE !!',
	initalArgs: [{
		type: 'input',
		name: 'imageUrl',
		message: 'Enter the image URL:'
		},{
			type: 'input',
			name: 'scrollTarget',
			message: 'Enter the scroll target javascript:',
			default: `_win.document.querySelectorAll('.m-pg-slot')[20]`
		},
		{
			type: 'input',
			name: 'clickURL',
			message: `Enter the click URL ${colors.yellow('(optional)')}:`,
			default: '!! PASTE CLICK URL HERE !!'
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
