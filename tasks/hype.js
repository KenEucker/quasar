let gulp = require('gulp'),
	colors = require('colors'),
	phantom = require('phantom'),
	promise = require('bluebird'),
	fs = require('fs');

const qType = path.basename(__filename).split('.')[0];
const shim = 'dt-lib-shim.js';
const config = require(`${process.cwd()}/config.js`);
const lib = fs.existsSync(`${config.assetsFolder}/${shim}`) ? require(`${config.assetsFolder}/${shim}`) : require(`${config.dirname}/lib.js`);
let dtAdsArgs = {};

const task = () => {
	return lib.unpackFiles(dtAdsArgs)
		.then(() => { return lib.moveTargetFilesToRootOfAssetsPath(dtAdsArgs) })
		.then(() => { return parseFiles() })
		.then(() => { return confirmationPrompt() })
		.then(() => { return lib.injectCode(dtAdsArgs) })
		.then(() => { return injectHypeAdCode() })
		.then(() => { return lib.copyFilesFromAssetsFolderToOutput(dtAdsArgs, [ '**' ] ) })
		.then(() => { return lib.uploadFiles(dtAdsArgs) })
		.then(() => { return lib.outputToHtmlFile(dtAdsArgs) })
		.finally(() => {
			if(dtAdsArgs.buildCompletedSuccessfully) {
				lib.logFin('build finished successfully');
			} else {
				lib.logInfo('build finished unexpectedly');
			}

			process.exit();
		});
}

const run = (args = {}) => {
	return validateRequiredArgs(args).then(task);
}

const validateRequiredArgs = (args = {}) => {
	return new Promise((resolve, reject) => {
		dtAdsArgs = lib.resolveQuasArgs(dtAdsArgs, args);
		
		if(dtAdsArgs.source && dtAdsArgs.source.length) {
			const split = dtAdsArgs.source.split('.');

			if(split.length > 1) {
				dtAdsArgs.sourceExt = `.${split.pop()}`;
				dtAdsArgs.source = dtAdsArgs.source.substr(0, dtAdsArgs.source.length - dtAdsArgs.sourceExt.length);
			}
		} else {
			//Default the input filename to the campaign
			dtAdsArgs.source = dtAdsArgs.campaign;
		}

		if(dtAdsArgs.output && dtAdsArgs.output.length) {
			const split = dtAdsArgs.output.split('.');

			if(split.length > 1) {
				dtAdsArgs.outputExt = split.pop();
				dtAdsArgs.output = dtAdsArgs.output.substr(0, dtAdsArgs.output.length - dtAdsArgs.outputExt.length);
			}
		} else {
			//Default the output filename to the campaign
			dtAdsArgs.output =`${dtAdsArgs.client}_${dtAdsArgs.campaign}_${dtAdsArgs.qType}`;
		}

		if(!dtAdsArgs.target || !dtAdsArgs.target.length) {
			dtAdsArgs.target = `${dtAdsArgs.source}.html`;
		} else {
			const split = dtAdsArgs.target.split('.');
			if(split.length == 1) {
				dtAdsArgs.target += '.html';
			}
		}
		dtAdsArgs.targetFilePath = `${dtAdsArgs.assetsFolder}/${dtAdsArgs.target}`;

		switch(dtAdsArgs.clickTarget) {
			default:
			case '':
			case 'default':
				dtAdsArgs.clickTarget = '';
			break;

			case 'same window':
				dtAdsArgs.clickTarget = '_self';
			break;
			
			case 'new tab':
				dtAdsArgs.clickTarget = '_blank';
			break;

			case 'parent':
				dtAdsArgs.clickTarget = '_parent';
			break;
			
			case 'top':
				dtAdsArgs.clickTarget = '_top';
			break;
		}

		const datetime = new Date(Date.now());
		dtAdsArgs.bucketPath = `ads/${dtAdsArgs.client}/${datetime.getFullYear()}/${datetime.getMonth() + 1}/${dtAdsArgs.campaign}`;

		return resolve();
	});
}

const getQuasarPrompts = () => {
	return dtAdsArgs.requiredArgs;
}

// Parse html input file for params
const parseFiles = () => {
	return new promise(async (resolve, reject) => {
		const instance = await phantom.create();
		const page = await instance.createPage();
		dtAdsArgs = lib.copyTemplateFilesToAssetsPath(dtAdsArgs);

		lib.log(`rendering target file (${dtAdsArgs.targetFilePath}) and learning parameters`);
		
		await page.on('onResourceRequested', function(requestData) {
			lib.log(`Requesting ${requestData.url}`);
		});
	
		const status = await page.open(dtAdsArgs.targetFilePath);
		//const content = await page.property('content');
		if(status == 'fail') {
			lib.logError('failed to open webpage');
			return reject();
		}
		
		const hypeElements = await page.evaluate(function() {
			var els = Array.prototype.slice.call(document.querySelectorAll('.h-track-click'));
			var hypeElementIds = [];

			for(var i in els) {
				hypeElementIds.push(els[i].id);
			}

			return hypeElementIds;
		});
		page.close();
		
		dtAdsArgs.hypeElements = hypeElements;
		return resolve(dtAdsArgs);
	});
}

// Confirm parsing results and get final ad unit parameters
const confirmationPrompt = () => {
	return new promise((resolve, reject) => {
		if (!dtAdsArgs.noPrompt) {
			lib.log('confirming parameters');

			lib.promptConsole([{
				type: 'checkbox',
				name: 'hypeElements',
				message: `Select the ids of the clickable HYPE elements to attach click events. The following ${dtAdsArgs.hypeElements.length} HYPE elements were found:`,
				choices: dtAdsArgs.hypeElements.map(c => { return { name: c, checked: true } })
			}], (res) => {
				dtAdsArgs = Object.assign(dtAdsArgs, res);

				return resolve(dtAdsArgs);
			});
		} else {
			return resolve(dtAdsArgs);
		}
	});
}

// Inject the ad code into the html file before applying template vars
const injectHypeAdCode = () => {
	return new promise((resolve, reject) => {
		// Nothing actually needs to be done here except for transforming the hypeElements object for output
		lib.log(`injecting HYPE specific adcode`);
		dtAdsArgs.hypeElements = dtAdsArgs.hypeElements.map(el => { return `'${el}'` }).join(',');
		return resolve(dtAdsArgs);
	});
}

// Test HYPE Ad Unit 

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
			type: 'list',
			name: 'source',
			message: `Enter the input archive filename (default .zip):\n`,
			choices: lib.getFilenamesInDirectory(lib.config.sourceFolder, ['zip'])
		},{
			type: 'input',
			name: 'target',
			message: `Enter the target html filename ${colors.yellow('(optional)')}:\n`
		},{
			type: 'input',
			name: 'output',
			message: `Enter the output filename postfix (default extension .txt ${colors.yellow('(optional)')}):\n`
		},{
			type: 'confirm',
			name: 'uploadToS3',
			message: `Upload assets to S3? ${colors.yellow('(optional)')}`,
			default: false
		},{
			type: 'list',
			name: 'clickTarget',
			// TODO: add better question intelligence here for the different ways to open a new window on click
			message: `How should the window open when clicked?`,
			default: 'default',
			choices: ['default','same window','new tab']//, 'parent','top']
		}]),
		{
			qType: qType,
			sourceExt: '.zip',
			googleAnalyticsID: 'UA-82208-8',
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