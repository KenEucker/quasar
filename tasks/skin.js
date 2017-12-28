let gulp = require('gulp'),
	promise = require('bluebird'),
	colors = require('colors'),
	fs = require('fs'),
	admZip = require('adm-zip');

const qType = path.basename(__filename).split('.')[0];
const shim = 'dt-lib-shim.js';
const config = require(`${process.cwd()}/config.js`);
const lib = fs.existsSync(`${config.assetsFolder}/${shim}`) ? require(`${config.assetsFolder}/${shim}`) : require(`${config.dirname}/lib.js`);
let dtAdsArgs = {};

const task = () => {
	return lib.injectCode(dtAdsArgs)
		.then(() => { return getSkinImageFilenames() })
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

const getSkinImageFilenames = () => {
	return new Promise((resolve, reject) => {
		const zipFileName = `${dtAdsArgs.sourceFolder}/${dtAdsArgs.source}${dtAdsArgs.sourceExt}`;
		let zip = new admZip(zipFileName),
			zipEntries = zip.getEntries(),
			setLeft = false, setRight = false;
	
		zipEntries.forEach((zipEntry) => {
			if (!(setLeft && setRight) && zipEntry.name.indexOf('.jpg') != -1) {
				if (zipEntry.name[0].toUpperCase() === "L") {
					dtAdsArgs.leftImageUrl = `${dtAdsArgs.cdnUrlStart}${dtAdsArgs.bucketPath}/${zipEntry.name}`;
					setLeft = true;
				} else if(zipEntry.name[0].toUpperCase() === "R") {
					dtAdsArgs.rightImageUrl = `${dtAdsArgs.cdnUrlStart}${dtAdsArgs.bucketPath}/${zipEntry.name}`;
					setRight = true;
				}
			}
		});

		return resolve();
	});
}

const validateRequiredArgs = (args = {}) => {
	return new Promise((resolve, reject) => {
		// Merge options with passed in parameters
		dtAdsArgs = lib.resolveQuasArgs(dtAdsArgs, args);

		if (dtAdsArgs.source && dtAdsArgs.source.length) {
			const split = dtAdsArgs.source.split('.');

			if (split.length > 1) {
				dtAdsArgs.sourceExt = `.${split.pop()}`;
				dtAdsArgs.source = dtAdsArgs.source.substr(0, dtAdsArgs.source.length - dtAdsArgs.sourceExt.length);
			}
		} else {
			//Default the input filename to the campaign
			dtAdsArgs.source = dtAdsArgs.campaign;
		}
		//dtAdsArgs.leftImageUrl = 
		//dtAdsArgs.rightImageUrl = `${dtAdsArgs.cdnUrlStart}${dtAdsArgs.client}/${dtAdsArgs.campaign}/${dtAdsArgs.imageName}`;

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
		return lib.initialPrompt(dtAdsArgs).then(task);
	} else {
		return run();
	}
});
gulp.task(`${qType}`, [`${qType}:build`]);

const init = () => {
	dtAdsArgs = lib.getQuasArgs(qType, lib.getCampaignPromptQuestions().concat([{
		type: 'list',
		name: 'source',
		message: `Select the source image for the skins ('left-' and 'right-'):\n`,
		choices: ['none'].concat(lib.getFilenamesInDirectory(lib.config.sourceFolder, ['zip'])),
		required: true
	}, {
		type: 'input',
		name: 'bgColor',
		message: 'Skin BG Color(HEX):'
	}, {
		type: 'input',
		name: 'output',
		message: `Enter the output filename postfix (default extension .txt ${colors.yellow('(optional)')}):\n`
	}, {
		type: 'confirm',
		name: 'uploadToS3',
		message: `Upload assets to S3? ${colors.yellow('(optional)')}`,
		default: false
	}]),
		{
			qType: qType,
			clickUrl: '!! PASTE CLICK URL HERE !!',
			impressionTracker: '!! PASTE IMPRESSION TRACKER URL HERE !!',
			sourceExt: '.zip',
			preload: true,
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