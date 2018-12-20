const phantom = require('phantom'),
	path = require('path'),
	quasarSDK = require(path.resolve(`${__dirname}/../index.js`)),
	// TODO: replace with require('quasar~task),
	DTQuasarTask = require(path.resolve(`${__dirname}/../src/dt-task.js`));

// console.log('required');
const qType = path.basename(__filename).split('.')[0];
const applicationRoot = process.cwd();
const oTypes = [qType, 'hub', 'billboard', 'halfpage'];
const purpose = `
builds out a single html page from a set of singular assets: css, html, js
with options to import files from an archived source
`;

class HypeQuasar extends DTQuasarTask {
	constructor(config, applicationRoot, args = {}, registerBuildTasks = true, qTypeExtend) {
		super(
			qTypeExtend || qType,
			oTypes,
			purpose,
			config,
			applicationRoot, {
				sourceExt: '.zip',
				googleAnalyticsID: 'UA-82208-8',
				debris: ['googleAnalytics.js', 'satellite.js', 'clickEvents.js', 'hypeAutoplay.js'],
				...args,
			},
			registerBuildTasks,
		);
	}

	build() {
		return quasarSDK.unpackSourceFiles(this.quasArgs)
			.then(function () {
				return quasarSDK.moveTargetFilesToRootOfAssetsPath(this.quasArgs)
			}.bind(this))
			.then(function (args) {
				this.quasArgs = args;
				return quasarSDK.copyTemplateFilesToAssetsPath(this.quasArgs);
			}.bind(this))
			.then(function (args) {
				this.quasArgs = args;
			}.bind(this))
			.then(function () {
				return this.parseFiles()
			}.bind(this))
			// .then(function() { return this.confirmationPrompt() }.bind(this))
			.then(function () {
				return quasarSDK.injectCode(this.quasArgs)
			}.bind(this))
			.then(function (args) {
				this.quasArgs = args;
				return this.injectHypeAdCode()
			}.bind(this))
			.then(function () {
				return quasarSDK.copyFilesFromAssetsFolderToOutput(this.quasArgs, ['**'])
			}.bind(this))
			.then(function () {
				return quasarSDK.outputToHtmlFile(this.quasArgs)
			}.bind(this))
			.then(function (args) {
				this.quasArgs = args;
				return quasarSDK.uploadOutputFiles(this.quasArgs)
			}.bind(this))
			.catch(this.error.bind(this));
	}

	validateRequiredArgs(args = {}) {
		quasarSDK.debug('will validateRequiredArgs', args);

		return new Promise(function (resolve) {
				this.resolveQuasArgs(args);
				resolve();
			}.bind(this))
			.then(function () {
				return quasarSDK.downloadSourceFilesToSourcesFolder(this.quasArgs);
			}.bind(this))
			.then(function () {
				this.setSourceAndOutputPlusArgs(this.quasArgs);
				this.quasArgs.debris = this.quasArgs.debris.length ? this.quasArgs.debris : ['satellite.js', 'googleAnalytics.js', 'hypeAutoplay.js', 'clickEvents.js'];

				switch (this.quasArgs.clickTarget) {
					default:
					case '':
					case 'default':
						this.quasArgs.clickTarget = '';
						break;

					case 'same window':
						this.quasArgs.clickTarget = '_self';
						break;

					case 'new tab':
						this.quasArgs.clickTarget = '_blank';
						break;

					case 'parent':
						this.quasArgs.clickTarget = '_parent';
						break;

					case 'top':
						this.quasArgs.clickTarget = '_top';
						break;
				}
			}.bind(this))
			.catch(function (e) {
				quasarSDK.logCritical(`${this.qType} validation error:`, e);
				throw e;
			}.bind(this));
	}

	getQuasarPrompts(config = null, separated = true) {
		if (!this.quasArgs.requiredArgs.length) {
			this.setConfig(config);

			let requiredArgs = [{
				type: 'list',
				name: 'source',
				shortMessage: 'Source',
				widget: 'file',
				message: `Enter the input archive filename (default .zip)`,
				choices: ['none'].concat(quasarSDK.getAvailableSourceFilenames(this.quasArgs)),
			}];

			let optionalArgs = [{
				type: 'input',
				name: 'target',
				shortMessage: 'Target HTML Filename',
				message: `Enter the target html filename`,
			}, {
				type: 'input',
				name: 'mainTimeline',
				shortMessage: 'Main Timeline Name',
				message: `Enter the name of the main timeline`,
				default: 'Main Timeline',
			}, {
				type: 'confirm',
				name: 'playTimelineImmediately',
				shortMessage: 'Play Main Timeline Immediately?',
				message: `Play the main timeline immediately?`,
				default: false,
			}, {
				type: 'list',
				name: 'clickTarget',
				shortMessage: 'Open New Window',
				// TODO: add better question intelligence here for the different ways to open a new window on click
				message: `How should the window open when clicked?`,
				default: 'default',
				choices: ['default', 'same window', 'new tab'], //, 'parent','top']
			}];
			requiredArgs = requiredArgs.concat(this.getDefaultQuasarQuestions(this.quasArgs));

			if (!separated) {
				return requiredArgs.concat(optionalArgs);
			}
			return {
				requiredArgs,
				optionalArgs,
			};
		}

		return super.getQuasarPrompts(separated);
	}

	// Parse html input file for params
	parseFiles() {
		return new Promise(async function (resolve, reject) {
			const instance = await phantom.create();
			const page = await instance.createPage();

			quasarSDK.logInfo(`rendering target file (${this.quasArgs.targetFilePath}) and learning parameters`);

			await page.on('onResourceRequested', function (requestData) {
				quasarSDK.logInfo(`Requesting ${requestData.url}`);
			}.bind(this));

			const status = await page.open(this.quasArgs.targetFilePath);
			//const content = await page.property('content');
			if (status == 'fail') {
				quasarSDK.logCritical('failed to open webpage');
				return reject();
			}

			const hypeElementsObj = await page.evaluate(function () {
				var els = Array.prototype.slice.call(document.getElementsByTagName('div'));
				var hypeElementIds = [];
				var numClickUrls = 1;

				for (var i in els) {
					var el = els[i];
					if ((el.id.length) && (el.id.indexOf('hype-') == -1) && (el.id.indexOf('HYPE_') == -1)) {
						for (var j = 0; j < el.classList.length; ++j) {
							if (el.classList[j].indexOf('h-url') != -1) {
								var urlIndex = parseInt(el.classList[j].substr(6));
								if (!isNaN(urlIndex) && numClickUrls < urlIndex) {
									numClickUrls = urlIndex;
								}
							}
						}
						hypeElementIds.push(el.id);
					}
				}

				return [hypeElementIds, numClickUrls];
			});
			page.close();

			this.quasArgs.hypeElements = hypeElementsObj[0];
			this.quasArgs.clickUrls = '';
			for (var i = 1; i <= hypeElementsObj[1]; ++i) {
				this.quasArgs.clickUrls += 'CLICK URL ' + i + ',';
			}

			resolve();
		}.bind(this));
	}

	// Confirm parsing results and get final ad unit parameters
	confirmationPrompt() {
		return new Promise(function (resolve) {
			if (!this.quasArgs.noPrompt) {
				quasarSDK.logInfo('confirming parameters');

				quasarSDK.promptConsole([{
					type: 'checkbox',
					name: 'hypeElements',
					message: `Select the ids of the clickable HYPE elements to attach click events. The following ${this.quasArgs.hypeElements.length} HYPE elements were found:`,
					choices: this.quasArgs.hypeElements.map(c => {
						return {
							name: c,
							checked: true,
						}
					})
				}], (res) => {
					this.quasArgs = Object.assign(this.quasArgs, res);

					resolve();
				});
			} else {
				resolve();
			}
		}.bind(this));
	}

	// Inject the ad code into the html file before applying template vars
	injectHypeAdCode() {
		return new Promise(function (resolve) {
			// Add the impression tracker img tag to the html file
			// `<img src="<%= impressionTracker %>" id="dt-impression-tracker-skin" />`;

			// Nothing actually needs to be done here except for transforming the hypeElements object for output
			// quasarSDK.logInfo(`injecting HYPE specific adcode`);
			this.quasArgs.hypeElements = this.quasArgs.hypeElements.map(el => {
				return `'${el}'`
			}).join(',');
			resolve();
		}.bind(this));
	}
}

module.exports = HypeQuasar;
module.exports.qType = qType;
module.exports.oTypes = oTypes;
module.exports.purpose = purpose;
