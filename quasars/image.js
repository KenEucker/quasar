const path = require('path'),
	quasarSDK = require(path.resolve(`${__dirname}/../index.js`)),
	// TODO: replace with require('quasar~task),
	DTQuasarTask = require(path.resolve(`${__dirname}/../src/dt-task.js`));

// console.log('required');

const qType = path.basename(__filename).split('.')[0];
const oTypes = [qType, 'atn', 'hub', 'product-card', 'billboard', 'halfpage'];
const purpose = `
			builds out a single html page from a set of singular assets: css, html, js 
			with options to import files from an archived source
		`;

// console.log('GOING TO FAIL NOW');
// conso;
class ImageQuasar extends DTQuasarTask {
	constructor(config, applicationRoot, args = {}, registerBuildTasks = true) {
		super(
			qType,
			oTypes,
			purpose,
			config,
			applicationRoot, {
				sourceExt: '.jpg',
				debris: ['satellite.js'],
				...args,
			},
			registerBuildTasks);
	}

	build() {
		return super.build()
			.then(function () {
				return quasarSDK.injectCode(this.quasArgs)
			}.bind(this))
			.then(function () {
				return quasarSDK.outputToHtmlFile(this.quasArgs);
			}.bind(this))
			.then(function (args) {
				this.quasArgs = args;
				return quasarSDK.uploadOutputFiles(this.quasArgs, ['*.txt']);
			}.bind(this))
			.catch(this.error.bind(this));
	}

	getQuasarPrompts(config = null, separated = true) {
		if (!this.quasArgs.requiredArgs.length) {
			this.setConfig(config);

			let requiredArgs = [{
				type: 'list',
				name: 'source',
				shortMessage: 'Source',
				widget: 'file',
				message: `Select the source image for the ${qType}`,
				choices: ['none'].concat(quasarSDK.getAvailableSourceFilenames(this.quasArgs)),
			}];

			let optionalArgs = [{
				type: 'input',
				name: 'clickUrl',
				shortMessage: 'Click URL',
				message: `Enter the click URL`,
				default: '!! PASTE CLICK URL HERE !!',
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

	validateRequiredArgs(args = {}) {
		return super.validateRequiredArgs(args)
			.then(function () {
				if (!(this.quasArgs.imageName && this.quasArgs.imageName.length)) {
					this.quasArgs.imageName = `${this.quasArgs.source}${this.quasArgs.sourceExt}`;
				} else {
					const split1 = this.quasArgs.imageName.split('.');
					if (split1.length < 2) {
						this.quasArgs.imageName = `${this.quasArgs.imageName}${this.quasArgs.sourceExt}`;
					}
				}
				this.quasArgs.imageUrl = `${this.quasArgs.cdnUrlStart}${this.quasArgs.bucketPath}/${this.quasArgs.imageName}`;

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
}

module.exports = ImageQuasar;
module.exports.qType = qType;
module.exports.oTypes = oTypes;
module.exports.purpose = purpose;
