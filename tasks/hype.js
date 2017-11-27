let gulp = require('gulp'),
	colors = require('colors'),
	phantom = require('phantom'),
	promise = require('bluebird'),
	fs = require('fs');

const adType = 'hype';
const shim = 'dt-lib-shim.js';
const config = require(`${process.cwd()}/config.js`);
const lib = fs.existsSync(`${config.assetsFolder}/${shim}`) ? require(`${config.assetsFolder}/${shim}`) : require(`${config.dirname}/lib.js`);
let dtAdsArgs = lib.getDefaultQuasArgs(adType);
dtAdsArgs = lib.registerRequiredQuasArgs(dtAdsArgs, {
	adType: adType,
});

const task = () => {
	return lib.unpackFiles(dtAdsArgs)
		.then(() => { return parseFiles() })
		.then(() => { return confirmationPrompt() })
		.then(() => { return lib.injectAdCode(dtAdsArgs) })
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
		dtAdsArgs = Object.assign(dtAdsArgs, args);

		if(dtAdsArgs.input && dtAdsArgs.input.length) {
			const split = dtAdsArgs.input.split('.');

			if(split.length > 1) {
				dtAdsArgs.inputExt = split.pop();
				dtAdsArgs.input = dtAdsArgs.input.substr(0, dtAdsArgs.input.length - dtAdsArgs.inputExt.length - 1);
			}
		} else {
			//Default the input filename to the campaign
			dtAdsArgs.input = dtAdsArgs.campaign;
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
			dtAdsArgs.target = `${dtAdsArgs.input}.html`;
		} else {
			const split = dtAdsArgs.target.split('.');
			if(split.length == 1) {
				dtAdsArgs.target += '.html';
			}
		}
		lib.log(`config location: ${process.cwd()}`, config, 'info');
		const datetime = new Date(Date.now());
		dtAdsArgs.s3Bucket = `${dtAdsArgs.bucket}/${dtAdsArgs.client}/${datetime.getFullYear()}/${datetime.getMonth() + 1}/${dtAdsArgs.campaign}`;
		dtAdsArgs.targetFilePath = lib.findTargetFile(dtAdsArgs);

		return resolve();
	});
};

// Get initial ad unit parameters
const initialPrompt = () => {
	const availableInputFiles = lib.getFilenamesInDirectory(dtAdsArgs.sourceFolder, ['zip']);

	// Only get the campaign questions if they weren't passed in
	let questions = !(lib.hasCampaignAnswers(dtAdsArgs)) ? lib.getCampaignPromptQuestions() : [];
	questions.push({
		type: 'list',
		name: 'input',
		message: `Enter the input archive filename (default extension .${dtAdsArgs.inputExt}):\n`,
		choices: availableInputFiles
	},{
		type: 'input',
		name: 'target',
		message: `Enter the target html filename ${colors.yellow('(optional)')}:\n`
	},{
		type: 'input',
		name: 'output',
		message: `Enter the output filename postfix (default extension .${dtAdsArgs.outputExt} ${colors.yellow('(optional)')}):\n`
	});

	return lib.promptConsole(questions, validateInitalArgs);
};

// Parse html input file for params
const parseFiles = () => {
	return new promise(async (resolve, reject) => {
		const instance = await phantom.create();
		const page = await instance.createPage();
		dtAdsArgs.targetFilePath = lib.findTargetFile(dtAdsArgs);
		
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