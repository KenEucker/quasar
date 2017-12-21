let gulp = require('gulp'),
	promise = require('bluebird'),
	colors = require('colors'),
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

const validateRequiredArgs = (args = {}) => {
	return new Promise((resolve, reject) => {
		// Merge options with passed in parameters
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

		return resolve();
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
			message: `Enter the output filename postfix (default extension .txt ${colors.yellow('(optional)')}):\n`
		}]),
		{
			qType: qType,
			clickUrl: '!! PASTE CLICK URL HERE !!',
			impressionTracker: '!! PASTE IMPRESSION TRACKER URL HERE !!',
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