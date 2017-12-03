let gulp = require('gulp'),
	template = require('gulp-template'),
	rename = require('gulp-rename'),
	promise = require('bluebird'),
	path = require('path'),
	colors = require('colors'),
	yargs = require('yargs'),
	fs = require('fs');

const adType = 'bigtop';
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
	windowTarget: '_blank',
	imageUrl: '!! PASTE BIGTOP IMAGE URL HERE!!',
	initalArgs: [{
			type: 'input',
			name: 'imageUrl',
			message: 'Bigtop URL:'
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