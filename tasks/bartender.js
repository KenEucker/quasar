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
const lib = fs.existsSync(`${config.templatesFolder}/${shim}`) ? require(`${config.templatesFolder}/${shim}`) : require(`${config.dirname}/lib.js`);
let dtAdsArgs = {};

const task = () => {
	return lib.injectCode(dtAdsArgs)
		.then(() => { return lib.outputToHtmlFile(dtAdsArgs); })
		.then(() => { return lib.copyFilesFromSourcesFolderToOutput(dtAdsArgs) })
		.then(() => { return lib.uploadFiles(dtAdsArgs, [ '*.txt' ]) })
}

const run = (args = {}) => {
	return validateRequiredArgs(args).then(task);
}

const getQuasarPrompts = () => {
	return dtAdsArgs.requiredArgs;
}

const validateRequiredArgs = (args) => {
	return new Promise((resolve, reject) => {
		dtAdsArgs = lib.resolveQuasArgs(dtAdsArgs, args);

		if (dtAdsArgs.source && dtAdsArgs.source.length && dtAdsArgs.source !== 'none') {
			const split = dtAdsArgs.source.split('.');

			if (split.length > 1) {
				dtAdsArgs.sourceExt = `.${split.pop()}`;
				dtAdsArgs.source = dtAdsArgs.source.substr(0, dtAdsArgs.source.length - dtAdsArgs.sourceExt.length);
			}
		} else {
			// No default for this value
			dtAdsArgs.source = null;
		}

		if (!(dtAdsArgs.imageName && dtAdsArgs.imageName.length)) {
			dtAdsArgs.imageName = `${dtAdsArgs.source}${dtAdsArgs.sourceExt}`;
		} else {
			const split1 = dtAdsArgs.imageName.split('.');
			if (split1.length < 2) {
				dtAdsArgs.imageName = `${dtAdsArgs.imageName}${dtAdsArgs.sourceExt}`;
			}
		}
		dtAdsArgs.imageUrl = `${dtAdsArgs.cdnUrlStart}${dtAdsArgs.bucketPath}/${dtAdsArgs.imageName}`;

		if (dtAdsArgs.output && dtAdsArgs.output.length) {
			const split = dtAdsArgs.output.split('.');

			if (split.length > 1) {
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
	if (!dtAdsArgs.noPrompt) {
		return lib.promptUser(dtAdsArgs).then(task);
	} else {
		return run();
	}
});

gulp.task(`${qType}`, [`${qType}:build`]);

const init = () => {
	dtAdsArgs = lib.getQuasArgs(qType, lib.getCampaignPromptQuestions().concat([{
		type: 'list',
		name: 'source',
		message: `Select the source image for the bartender:`,
		choices: ['none'].concat(lib.getFilenamesInDirectory(lib.config.sourceFolder, ['jpg'])),
		required: true
	}, {
		type: 'input',
		name: 'imageName',
		message: `enter the name of the image (source)`,
		optional: true
	}, {
		type: 'input',
		name: 'output',
		message: `Enter the output filename postfix (default extension .txt):`,
		optional: true
	},{
		type: 'confirm',
		name: 'uploadToS3',
		message: `Upload assets to S3?`,
		default: false,
		optional: true
	}]),
		{
			qType: qType,
			clickUrl: '!! PASTE CLICK URL HERE !!',
			impressionTracker: '!! PASTE IMPRESSION TRACKER URL HERE !!',
			backgroundColor: 'transparent',
			clickTarget: '_blank',
			adHtml: '',
			sourceExt: '.jpg',
			requiredArgsValidation: validateRequiredArgs
		}, false);
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