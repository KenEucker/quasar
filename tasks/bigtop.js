let gulp = require('gulp'),
	template = require('gulp-template'),
	rename = require('gulp-rename'),
	promise = require('bluebird'),
	path = require('path'),
	colors = require('colors'),
	yargs = require('yargs'),
	fs = require('fs');

const qType = path.basename(__filename).split('.')[0];
const shim = 'dt-lib-shim.js';
const config = require(`${process.cwd()}/config.js`);
const lib = fs.existsSync(`${config.assetsFolder}/${shim}`) ? require(`${config.assetsFolder}/${shim}`) : require(`${config.dirname}/lib.js`);
let dtAdsArgs = {};

const task = () => {
	return lib.injectCode(dtAdsArgs)
	.then(() => { lib.outputToHtmlFile(dtAdsArgs); });
};

const run = (args = {}) => {
	return validateRequiredArgs(args).then(task);
};

const getQuasarPrompts = () => {
	return dtAdsArgs.requiredArgs;
}

const validateRequiredArgs = (args) => {
	return new Promise((resolve, reject) => {
		dtAdsArgs = lib.resolveQuasArgs(dtAdsArgs, args);

		if(dtAdsArgs.output && dtAdsArgs.output.length) {
			const split = dtAdsArgs.output.split('.');

			if(split.length > 1) {
				dtAdsArgs.outputExt = split.pop();
				dtAdsArgs.output = dtAdsArgs.output.substr(0, dtAdsArgs.output.length - dtAdsArgs.outputExt.length);
			}
		} else {
			//Default the output filename to the campaign
			dtAdsArgs.output = `${dtAdsArgs.campaign}_${dtAdsArgs.qType}`;
		}

		dtAdsArgs = lib.copyTemplateFilesToAssetsPath(dtAdsArgs);
		return resolve(dtAdsArgs);
	});
};

gulp.task(`${qType}:build`, () => {
	if(!dtAdsArgs.noPrompt) {
		return lib.initialPrompt(dtAdsArgs).then(task);
	} else {
		return run();
	}
});
gulp.task(`${qType}`, [`${qType}:build`]);

const init = () => {
	dtAdsArgs = lib.getQuasArgs(qType, lib.getCampaignPromptQuestions().concat([{
			type: 'input',
			name: 'imageUrl',
			message: 'Bigtop URL:'
		},
		{
			type: 'input',
			name: 'output',
			message: `Enter the output filename postfix (default extension .${dtAdsArgs.outputExt} ${colors.yellow('(optional)')}):\n`
		}]),
		{
			qType: qType,
			clickUrl: '!! PASTE CLICK URL HERE !!',
			windowTarget: '_blank',
			imageUrl: '!! PASTE BIGTOP IMAGE URL HERE!!',
			requiredArgsValidation: validateRequiredArgs }, false);
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