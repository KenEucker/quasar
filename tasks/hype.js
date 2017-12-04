let gulp = require('gulp'),
	colors = require('colors'),
	phantom = require('phantom'),
	promise = require('bluebird'),
	fs = require('fs');

const adType = 'hype';
const shim = 'dt-lib-shim.js';
const config = require(`${process.cwd()}/config.js`);
const lib = fs.existsSync(`${config.assetsFolder}/${shim}`) ? require(`${config.assetsFolder}/${shim}`) : require(`${config.dirname}/lib.js`);

const task = () => {
	return lib.unpackFiles(dtAdsArgs)
		.then(() => { return parseFiles() })
		.then(() => { return confirmationPrompt() })
		.then(() => { return lib.injectCode(dtAdsArgs) })
		.then(() => { return injectHypeAdCode() })
		.then(() => { return lib.uploadFiles(dtAdsArgs) })
		.then(() => { return lib.outputToHtmlFile(dtAdsArgs) })
		.finally(() => {
			if(dtAdsArgs.buildCompletedSuccessfully) {
				lib.logFin('build finished successfully');
			} else {
				lib.logInfo('build finished unexpectedly');
			}
			// resolve();
			process.exit();
		});
};

const run = () => {
	return validateInitalArgs().then(task());
};

const validateInitalArgs = (args = {}) => {
	return new Promise((resolve, reject) => {
		dtAdsArgs = lib.resolveQuasArgs(dtAdsArgs, args);
		
		if(dtAdsArgs.source && dtAdsArgs.source.length) {
			const split = dtAdsArgs.source.split('.');

			if(split.length > 1) {
				dtAdsArgs.sourceExt = split.pop();
				dtAdsArgs.source = dtAdsArgs.source.substr(0, dtAdsArgs.source.length - dtAdsArgs.sourceExt.length - 1);
			}
		} else {
			//Default the input filename to the campaign
			dtAdsArgs.source = dtAdsArgs.campaign;
		}

		if(dtAdsArgs.output && dtAdsArgs.output.length) {
			const split = dtAdsArgs.output.split('.');

			if(split.length > 1) {
				dtAdsArgs.outputExt = split.pop();
				dtAdsArgs.output = dtAdsArgs.output.substr(0, dtAdsArgs.output.length - dtAdsArgs.outputExt.length - 1);
			}
		} else {
			//Default the output filename to the campaign
			dtAdsArgs.output =`${dtAdsArgs.campaign}_${dtAdsArgs.adType}`;
		}

		if(!dtAdsArgs.target || !dtAdsArgs.target.length) {
			dtAdsArgs.target = `${dtAdsArgs.source}.html`;
		} else {
			const split = dtAdsArgs.target.split('.');
			if(split.length == 1) {
				dtAdsArgs.target += '.html';
			}
		}

		const datetime = new Date(Date.now());
		dtAdsArgs.bucketPath = `${dtAdsArgs.bucket}/${dtAdsArgs.client}/${datetime.getFullYear()}/${datetime.getMonth() + 1}/${dtAdsArgs.campaign}`;
		dtAdsArgs.targetFilePath = lib.findTargetFile(dtAdsArgs);
		return resolve();
	});
};

// Parse html input file for params
const parseFiles = () => {
	return new promise(async (resolve, reject) => {
		const instance = await phantom.create();
		const page = await instance.createPage();
		dtAdsArgs.targetFilePath = lib.copyTargetFileToOutputPath(dtAdsArgs);

		lib.log(`rendering target file (${dtAdsArgs.targetFilePath}) and learning parameters`);
		
		await page.on('onResourceRequested', function(requestData) {
			lib.log('Requesting', requestData.url);
		});
	
		const status = await page.open(dtAdsArgs.targetFilePath);
		//const content = await page.property('content');
		if(status == 'fail') {
			lib.logError('failed to open webpage');
			return reject();
		}
		
		const hypeElements = await page.evaluate(function() {
			var els = Array.prototype.slice.call(document.querySelectorAll('.HYPE_element:not([id|="hype-obj"])'));
			var hypeElementIds = [];

			for(var i in els) {
				hypeElementIds.push(els[i].id);
			}

			return hypeElementIds;
		});

		dtAdsArgs.hypeElements = hypeElements;
		resolve(dtAdsArgs);
	});
};

// Confirm parsing results and get final ad unit parameters
const confirmationPrompt = () => {
	return new promise((resolve, reject) => {
		lib.log('confirming parameters');

		lib.promptConsole([{
			type: 'checkbox',
			name: 'hypeElements',
			message: `Select the ids of the clickable HYPE elements to attach click events. The following ${dtAdsArgs.hypeElements.length} HYPE elements were found:`,
			choices: dtAdsArgs.hypeElements.map(c => { return { name: c, checked: true } })
		},{
			type: 'confirm',
			name: 'uploadToS3',
			message: `Upload assets to S3? ${colors.yellow('(optional)')}`,
			default: false
		}], (res) => {
			dtAdsArgs = Object.assign(dtAdsArgs, res);

			resolve(dtAdsArgs);
		});
	});
};

// Inject the ad code into the html file before applying template vars
const injectHypeAdCode = () => {
	return new promise((resolve, reject) => {
		dtAdsArgs.hypeElements = dtAdsArgs.hypeElements.map(el => { return `'${el}'` }).join(',');
		// Nothing actually needs to be done here except for transforming the hypeElements object for output
		lib.log(`injecting HYPE specific adcode`);
		resolve(dtAdsArgs);
	});
};

// Test HYPE Ad Unit 

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
	sourceExt: 'zip',
	googleAnalyticsID: 'UA-82208-8',
	initalArgs: [{
		type: 'list',
		name: 'source',
		message: `Enter the input archive filename (default .zip):\n`,
		choices: lib.getFilenamesInDirectory(dtAdsArgs.sourceFolder, ['zip'])
	},{
		type: 'input',
		name: 'target',
		message: `Enter the target html filename ${colors.yellow('(optional)')}:\n`
	},{
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